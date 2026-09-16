import { Head, Link, usePage } from '@inertiajs/react';
import { Users, UserRound, UserRoundCheck } from 'lucide-react';

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

type PageProps = {
    students: Student[];
};

export default function Dashboard() {
    const { students = [] } = usePage<PageProps>().props;

    const totalStudents = students.length;

    const programs = new Set(
        students.map((student) => student.program).filter(Boolean)
    ).size;

    const maleStudents = students.filter(
        (student) => student.gender?.toLowerCase() === 'male'
    ).length;

    const femaleStudents = students.filter(
        (student) => student.gender?.toLowerCase() === 'female'
    ).length;

    return (
        <>
            <Head title="Student Dashboard" />

            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">
                                Student Dashboard
                            </h1>

                            <p className="text-muted-foreground">
                                Manage your students and their information.
                            </p>
                        </div>

                        <Link
                            href="/students"
                            className="rounded-md bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                        >
                            View Students
                        </Link>
                    </div>

                    {/* Statistics */}
                    <div className="grid gap-4 md:grid-cols-3">

                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-muted-foreground" />

                                <p className="text-sm text-muted-foreground">
                                    Total Students
                                </p>
                            </div>

                            <p className="mt-3 text-3xl font-bold">
                                {totalStudents}
                            </p>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <UserRound className="h-5 w-5 text-muted-foreground" />

                                <p className="text-sm text-muted-foreground">
                                    Programs
                                </p>
                            </div>

                            <p className="mt-3 text-3xl font-bold">
                                {programs}
                            </p>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <UserRoundCheck className="h-5 w-5 text-muted-foreground" />

                                <p className="text-sm text-muted-foreground">
                                    Male / Female
                                </p>
                            </div>

                            <p className="mt-3 text-3xl font-bold">
                                {maleStudents} / {femaleStudents}
                            </p>
                        </div>

                    </div>

                    {/* Students Section */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">

                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Students
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    View and manage all {totalStudents} students.
                                </p>
                            </div>

                            <Link
                                href="/students"
                                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                            >
                                View All Students
                            </Link>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">

                            <div className="rounded-lg border p-5">
                                <p className="text-sm text-muted-foreground">
                                    Total Students
                                </p>

                                <p className="mt-2 text-2xl font-bold">
                                    {totalStudents}
                                </p>
                            </div>

                            <div className="rounded-lg border p-5">
                                <p className="text-sm text-muted-foreground">
                                    Male Students
                                </p>

                                <p className="mt-2 text-2xl font-bold">
                                    {maleStudents}
                                </p>
                            </div>

                            <div className="rounded-lg border p-5">
                                <p className="text-sm text-muted-foreground">
                                    Female Students
                                </p>

                                <p className="mt-2 text-2xl font-bold">
                                    {femaleStudents}
                                </p>
                            </div>

                        </div>

                        <div className="mt-6">
                            <Link
                                href="/students"
                                className="inline-block rounded-md bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                            >
                                Manage Students →
                            </Link>
                        </div>

                    </div>

                </div>
            </div>
        </>
    );
}