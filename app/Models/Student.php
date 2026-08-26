<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Student extends Model
{
    use HasFactory;

    protected $fillable =[
        'first name',
        'last name',
        'email',
        'program',
        'year_level',
        'gender',
        'birthday',
        
    ];
    protected $casts =[
        'birthday' => 'date',
    ];

    protected $appends =[
        'age'
    ];

    public function getAgeattribute(){
        return $this->birthday?->age;
    }
    //
}
