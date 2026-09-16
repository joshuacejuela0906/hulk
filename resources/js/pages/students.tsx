import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

type Student = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    program: string;
    year_level: number;
    gender: string;
    birthday: string | null;
    age: number | null;
};

type Pagination = {
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type StudentForm = {
    first_name: string;
    last_name: string;
    email: string;
    program: string;
    gender: string;
    year_level: string;
    birthday: string;
};

const emptyForm: StudentForm = {
    first_name: '',
    last_name: '',
    email: '',
    program: '',
    gender: '',
    year_level: '1',
    birthday: '',
};

export default function Students() {
    const [students, setStudents] = useState<Student[]>([]);
    const [pagination, setPagination] =
        useState<Pagination | null>(null);

    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] =
        useState<Student | null>(null);

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [form, setForm] = useState<StudentForm>(emptyForm);

    /*
    |--------------------------------------------------------------------------
    | Load Students
    |--------------------------------------------------------------------------
    */

    const loadStudents = useCallback(
        async (page = 1, searchValue = '') => {
            try {
                setLoading(true);
                setError('');

                const params = new URLSearchParams();

                params.set('page', String(page));

                if (searchValue.trim() !== '') {
                    params.set(
                        'search',
                        searchValue.trim(),
                    );
                }

                const response = await fetch(
                    `/student?${params.toString()}`,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With':
                                'XMLHttpRequest',
                        },
                    },
                );

                const contentType =
                    response.headers.get('content-type') ?? '';

                if (!response.ok) {
                    let message = `Server returned ${response.status}`;

                    if (
                        contentType.includes(
                            'application/json',
                        )
                    ) {
                        const errorData =
                            await response.json();

                        message =
                            errorData.message ?? message;
                    }

                    throw new Error(message);
                }

                if (
                    !contentType.includes(
                        'application/json',
                    )
                ) {
                    throw new Error(
                        'The server did not return JSON. Check your Laravel route.',
                    );
                }

                const result = await response.json();

                setStudents(
                    Array.isArray(result.data)
                        ? result.data
                        : [],
                );

                setPagination({
                    current_page:
                        result.current_page ?? 1,
                    last_page:
                        result.last_page ?? 1,
                    total: result.total ?? 0,
                    from: result.from ?? null,
                    to: result.to ?? null,
                });
            } catch (err) {
                console.error(
                    'Load students error:',
                    err,
                );

                setStudents([]);

                setError(
                    err instanceof Error
                        ? err.message
                        : 'Unable to load students.',
                );
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    /*
    |--------------------------------------------------------------------------
    | Initial Load
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        loadStudents(1, '');
    }, [loadStudents]);

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    const handleSearch = (
        value: string,
    ) => {
        setSearch(value);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadStudents(1, search);
        }, 400);

        return () => clearTimeout(timer);
    }, [search, loadStudents]);

    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    const resetForm = () => {
        setForm({ ...emptyForm });
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingStudent(null);
        resetForm();
    };

    const openAdd = () => {
        resetForm();
        setEditingStudent(null);
        setShowForm(true);
    };

    const openEdit = (
        student: Student,
    ) => {
        setEditingStudent(student);

        setForm({
            first_name: student.first_name ?? '',
            last_name: student.last_name ?? '',
            email: student.email ?? '',
            program: student.program ?? '',
            gender: student.gender ?? '',
            year_level: String(
                student.year_level ?? 1,
            ),
            birthday: student.birthday ?? '',
        });

        setShowForm(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Save Student
    |--------------------------------------------------------------------------
    */

    const saveStudent = async () => {
        if (saving) {
            return;
        }

        try {
            setSaving(true);

            const editing =
                editingStudent !== null;

            const url = editing
                ? `/student/${editingStudent.id}`
                : '/student';

            const method = editing
                ? 'PUT'
                : 'POST';

            const csrfToken =
                document
                    .querySelector(
                        'meta[name="csrf-token"]',
                    )
                    ?.getAttribute('content') ?? '';

            const response = await fetch(
                url,
                {
                    method,
                    headers: {
                        'Content-Type':
                            'application/json',
                        Accept:
                            'application/json',
                        'X-Requested-With':
                            'XMLHttpRequest',
                        'X-CSRF-TOKEN':
                            csrfToken,
                    },
                    body: JSON.stringify({
                        first_name:
                            form.first_name.trim(),

                        last_name:
                            form.last_name.trim(),

                        email:
                            form.email.trim(),

                        program:
                            form.program.trim(),

                        gender:
                            form.gender,

                        year_level:
                            Number(
                                form.year_level,
                            ),

                        birthday:
                            form.birthday,
                    }),
                },
            );

            const contentType =
                response.headers.get(
                    'content-type',
                ) ?? '';

            let result: any = null;

            if (
                contentType.includes(
                    'application/json',
                )
            ) {
                result =
                    await response.json();
            } else {
                const text =
                    await response.text();

                console.error(
                    'Non-JSON response:',
                    text,
                );
            }

            if (!response.ok) {
                if (
                    result?.errors
                ) {
                    const errors =
                        Object.values(
                            result.errors,
                        ) as string[][];

                    if (
                        errors.length > 0 &&
                        errors[0]?.length > 0
                    ) {
                        alert(
                            errors[0][0],
                        );
                    } else {
                        alert(
                            'Please check the student information.',
                        );
                    }
                } else {
                    alert(
                        result?.message ??
                            'Failed to save student.',
                    );
                }

                return;
            }

            closeForm();

            await loadStudents(
                pagination?.current_page ??
                    1,
                search,
            );
        } catch (err) {
            console.error(
                'Save student error:',
                err,
            );

            alert(
                err instanceof Error
                    ? err.message
                    : 'Something went wrong while saving.',
            );
        } finally {
            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Student
    |--------------------------------------------------------------------------
    */

    const deleteStudent = async (
        student: Student,
    ) => {
        const confirmed =
            window.confirm(
                `Are you sure you want to delete ${student.first_name} ${student.last_name}?`,
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(student.id);

            const csrfToken =
                document
                    .querySelector(
                        'meta[name="csrf-token"]',
                    )
                    ?.getAttribute('content') ?? '';

            const response =
                await fetch(
                    `/student/${student.id}`,
                    {
                        method: 'DELETE',
                        headers: {
                            Accept:
                                'application/json',
                            'X-Requested-With':
                                'XMLHttpRequest',
                            'X-CSRF-TOKEN':
                                csrfToken,
                        },
                    },
                );

            const contentType =
                response.headers.get(
                    'content-type',
                ) ?? '';

            let result: any = null;

            if (
                contentType.includes(
                    'application/json',
                )
            ) {
                result =
                    await response.json();
            }

            if (!response.ok) {
                throw new Error(
                    result?.message ??
                        `Server returned ${response.status}`,
                );
            }

            let page =
                pagination?.current_page ??
                1;

            if (
                students.length === 1 &&
                page > 1
            ) {
                page--;
            }

            await loadStudents(
                page,
                search,
            );
        } catch (err) {
            console.error(
                'Delete student error:',
                err,
            );

            alert(
                err instanceof Error
                    ? err.message
                    : 'Failed to delete student.',
            );
        } finally {
            setDeletingId(null);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Date Formatting
    |--------------------------------------------------------------------------
    */

    const formatBirthday = (
        birthday: string | null,
    ) => {
        if (!birthday) {
            return '-';
        }

        const date = new Date(
            `${birthday}T00:00:00`,
        );

        if (
            Number.isNaN(
                date.getTime(),
            )
        ) {
            return birthday;
        }

        return date.toLocaleDateString();
    };

    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Students" />

            <div className="min-h-screen bg-background text-foreground">
                <div className="mx-auto w-full max-w-7xl px-6 py-8">

                    {/* HEADER */}

                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Students
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                View and manage all student information.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href="/dashboard"
                                className="rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
                            >
                                Back to Dashboard
                            </Link>

                            <button
                                type="button"
                                onClick={openAdd}
                                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                            >
                                + Add Student
                            </button>
                        </div>
                    </div>

                    {/* ERROR */}

                    {error && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <div className="font-medium">
                                Unable to load students.
                            </div>

                            <div className="mt-1">
                                {error}
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    loadStudents(
                                        pagination?.current_page ??
                                            1,
                                        search,
                                    )
                                }
                                className="mt-2 font-semibold underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* LIST HEADER */}

                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">
                                Student List
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                {pagination?.total ??
                                    0}{' '}
                                students total
                            </p>
                        </div>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                handleSearch(
                                    e.target.value,
                                )
                            }
                            placeholder="Search students..."
                            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary sm:w-80"
                        />
                    </div>

                    {/* TABLE */}

                    <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-4 text-left font-semibold">
                                            Name
                                        </th>

                                        <th className="px-4 py-4 text-left font-semibold">
                                            Email
                                        </th>

                                        <th className="px-4 py-4 text-left font-semibold">
                                            Age
                                        </th>

                                        <th className="px-4 py-4 text-left font-semibold">
                                            Birthday
                                        </th>

                                        <th className="px-4 py-4 text-left font-semibold">
                                            Program
                                        </th>

                                        <th className="px-4 py-4 text-left font-semibold">
                                            Gender
                                        </th>

                                        <th className="px-4 py-4 text-left font-semibold">
                                            Year
                                        </th>

                                        <th className="px-4 py-4 text-right font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-4 py-16 text-center text-muted-foreground"
                                            >
                                                Loading students...
                                            </td>
                                        </tr>
                                    ) : students.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-4 py-16 text-center text-muted-foreground"
                                            >
                                                No students found.
                                            </td>
                                        </tr>
                                    ) : (
                                        students.map(
                                            (
                                                student,
                                            ) => (
                                                <tr
                                                    key={
                                                        student.id
                                                    }
                                                    className="border-b last:border-b-0 hover:bg-muted/30"
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="font-medium">
                                                            {
                                                                student.first_name
                                                            }{' '}
                                                            {
                                                                student.last_name
                                                            }
                                                        </div>

                                                        <div className="text-xs text-muted-foreground">
                                                            ID:{' '}
                                                            {
                                                                student.id
                                                            }
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4 text-muted-foreground">
                                                        {
                                                            student.email
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        {
                                                            student.age ??
                                                            '-'
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        {formatBirthday(
                                                            student.birthday,
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        {
                                                            student.program
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4 capitalize">
                                                        {
                                                            student.gender
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        Year{' '}
                                                        {
                                                            student.year_level
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEdit(
                                                                        student,
                                                                    )
                                                                }
                                                                className="rounded-md border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    deletingId ===
                                                                    student.id
                                                                }
                                                                onClick={() =>
                                                                    deleteStudent(
                                                                        student,
                                                                    )
                                                                }
                                                                className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {deletingId ===
                                                                student.id
                                                                    ? 'Deleting...'
                                                                    : 'Delete'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}

                        {pagination &&
                            pagination.last_page >
                                1 && (
                                <div className="flex flex-col gap-4 border-t bg-muted/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Showing{' '}
                                        {
                                            pagination.from
                                        }{' '}
                                        to{' '}
                                        {
                                            pagination.to
                                        }{' '}
                                        of{' '}
                                        {
                                            pagination.total
                                        }{' '}
                                        students
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={
                                                pagination.current_page ===
                                                1
                                            }
                                            onClick={() =>
                                                loadStudents(
                                                    pagination.current_page -
                                                        1,
                                                    search,
                                                )
                                            }
                                            className="rounded-md border px-4 py-2 text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Previous
                                        </button>

                                        <span className="px-3 text-sm">
                                            Page{' '}
                                            {
                                                pagination.current_page
                                            }{' '}
                                            of{' '}
                                            {
                                                pagination.last_page
                                            }
                                        </span>

                                        <button
                                            type="button"
                                            disabled={
                                                pagination.current_page ===
                                                pagination.last_page
                                            }
                                            onClick={() =>
                                                loadStudents(
                                                    pagination.current_page +
                                                        1,
                                                    search,
                                                )
                                            }
                                            className="rounded-md border px-4 py-2 text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            </div>

            {/* ADD / EDIT MODAL */}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-background p-6 shadow-xl">

                        {/* MODAL HEADER */}

                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">
                                    {editingStudent
                                        ? 'Edit Student'
                                        : 'Add Student'}
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Enter the student's information.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                className="text-2xl text-muted-foreground transition hover:text-foreground"
                            >
                                ×
                            </button>
                        </div>

                        {/* FORM */}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                            {/* FIRST NAME */}

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    First Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        form.first_name
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            first_name:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:border-primary"
                                />
                            </div>

                            {/* LAST NAME */}

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Last Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        form.last_name
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            last_name:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:border-primary"
                                />
                            </div>

                            {/* EMAIL */}

                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            email: e.target
                                                .value,
                                        })
                                    }
                                    className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:border-primary"
                                />
                            </div>

                            {/* BIRTHDAY */}

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Birthday
                                </label>

                                <input
                                    type="date"
                                    value={
                                        form.birthday
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            birthday:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:border-primary"
                                />
                            </div>

                            {/* PROGRAM */}

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Program
                                </label>

                                <input
                                    type="text"
                                    value={
                                        form.program
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            program:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    placeholder="e.g. BSIT"
                                    className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:border-primary"
                                />
                            </div>

                            {/* GENDER */}

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Gender
                                </label>

                                <select
                                    value={
                                        form.gender
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            gender:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:border-primary"
                                >
                                    <option value="">
                                        Select gender
                                    </option>

                                    <option value="male">
                                        Male
                                    </option>

                                    <option value="female">
                                        Female
                                    </option>
                                </select>
                            </div>

                            {/* YEAR LEVEL */}

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Year Level
                                </label>

                                <select
                                    value={
                                        form.year_level
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            year_level:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:border-primary"
                                >
                                    <option value="1">
                                        Year 1
                                    </option>

                                    <option value="2">
                                        Year 2
                                    </option>

                                    <option value="3">
                                        Year 3
                                    </option>

                                    <option value="4">
                                        Year 4
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* BUTTONS */}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeForm}
                                className="rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={saveStudent}
                                disabled={saving}
                                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving
                                    ? 'Saving...'
                                    : editingStudent
                                      ? 'Update Student'
                                      : 'Add Student'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}