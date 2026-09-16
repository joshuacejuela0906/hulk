<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\TeamInvitation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        /*
        |--------------------------------------------------------------------------
        | Get pending invitations
        |--------------------------------------------------------------------------
        */

        $email = strtolower($request->user()->email);

        $pendingInvitations = TeamInvitation::query()
            ->with(['inviter', 'team'])
            ->whereRaw('LOWER(email) = ?', [$email])
            ->whereNull('accepted_at')
            ->where(function ($query) {
                $query
                    ->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', now());
            })
            ->latest()
            ->get()
            ->map(function (TeamInvitation $invitation) {
                return [
                    'code' => $invitation->code,
                    'inviterName' => $invitation->inviter->name,
                    'team' => [
                        'name' => $invitation->team->name,
                        'slug' => $invitation->team->slug,
                    ],
                ];
            });

        /*
        |--------------------------------------------------------------------------
        | Get students
        |--------------------------------------------------------------------------
        */

        $students = Student::query()
            ->latest()
            ->get()
            ->map(function (Student $student) {
                return [
                    'id' => $student->id,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'email' => $student->email,
                    'program' => $student->program,
                    'year_level' => $student->year_level,
                    'gender' => $student->gender,
                    'birthday' => $student->birthday
                        ? $student->birthday->format('Y-m-d')
                        : null,
                    'age' => $student->age,
                ];
            })
            ->values()
            ->toArray();

        /*
        |--------------------------------------------------------------------------
        | Send everything to React
        |--------------------------------------------------------------------------
        */

        return Inertia::render('dashboard', [
            'pendingInvitations' => $pendingInvitations,
            'students' => $students,
        ]);
    }
}