<?php

namespace Database\Factories;

use App\Models\student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<student>
 */
class StudentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => fake()->name(),
            'last_name' =>fake()->name(),
            'email' =>fake()->unique()->safeEmail(),
            'program' =>fake()->randomElement([
            'BSIT',
            'BSCS',
            'BSIS',
            ]),
            'year_level' => fake()->numberBetween(1,4),

        
         'gender' => fake()->randomElement([
            'female',
            'male'
         ]),
         'birthday' =>fake()
         ->dateTimeBetween('-25 years', '-17 years')
         ->format('Y-m-d'),
         'year_level' => fake()->numberBetween(1,4),
        ];
    }
};
