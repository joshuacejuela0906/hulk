<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'program',
        'year_level',
        'gender',
        'birthday',
    ];

    protected $casts = [
        'birthday' => 'date',
    ];

    protected $appends = [
        'age',
    ];

    public function getAgeAttribute()
    {
        return $this->birthday?->age;
    }
}