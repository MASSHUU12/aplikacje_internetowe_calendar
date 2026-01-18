<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'calendar_id',
        'title',
        'description',
        'location',
        'starts_at',
        'ends_at',
        'all_day',
        'timezone',
        'recurrence_rule',
        'status',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'all_day' => 'boolean',
    ];

    public function calendar()
    {
        return $this->belongsTo(Calendar::class);
    }
}
