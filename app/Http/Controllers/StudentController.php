<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $search = trim(
            $request->input('search', '')
        );

        $students = Student::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where(
                        'first_name',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'last_name',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'email',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'program',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'gender',
                        'like',
                        "%{$search}%"
                    );
                });
            })
            ->latest()
            ->paginate(20);

        return response()->json($students);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => [
                'required',
                'string',
                'max:100',
            ],

            'last_name' => [
                'required',
                'string',
                'max:100',
            ],

            'birthday' => [
                'required',
                'date',
                'before:today',
            ],

            'email' => [
                'required',
                'email',
                'unique:students,email',
            ],

            'program' => [
                'required',
                'string',
                'max:60',
            ],

            'gender' => [
                'required',
                'string',
                'max:60',
            ],

            'year_level' => [
                'required',
                'integer',
                'min:1',
                'max:4',
            ],
        ]);

        $student = Student::create($validated);

        return response()->json(
            $student,
            201
        );
    }

    public function show(string $id)
    {
        $student = Student::findOrFail($id);

        return response()->json($student);
    }

    public function update(
        Request $request,
        string $id
    ) {
        $student = Student::findOrFail($id);

        $validated = $request->validate([
            'first_name' => [
                'required',
                'string',
                'max:100',
            ],

            'last_name' => [
                'required',
                'string',
                'max:100',
            ],

            'birthday' => [
                'required',
                'date',
                'before:today',
            ],

            'email' => [
                'required',
                'email',
                'unique:students,email,' . $student->id,
            ],

            'program' => [
                'required',
                'string',
                'max:60',
            ],

            'gender' => [
                'required',
                'string',
                'max:60',
            ],

            'year_level' => [
                'required',
                'integer',
                'min:1',
                'max:4',
            ],
        ]);

        $student->update($validated);

        $student->refresh();

        return response()->json($student);
    }

    public function destroy(string $id)
    {
        $student = Student::findOrFail($id);

        $student->delete();

        return response()->json([
            'message' => 'Student deleted successfully.',
        ]);
    }

    public function create()
    {
        return response()->json([
            'message' => 'Create student form',
        ]);
    }

    public function edit(string $id)
    {
        $student = Student::findOrFail($id);

        return response()->json($student);
    }
}