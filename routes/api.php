<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\EventController;
use App\Http\Middleware\CheckUserBlocked;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware(['auth:sanctum', CheckUserBlocked::class])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::patch('/user/password', [AuthController::class, 'updatePassword']);

    Route::get('/calendars', [CalendarController::class, 'index']);
    Route::post('/calendars', [CalendarController::class, 'store']);
    Route::get('/calendars/{calendar}', [CalendarController::class, 'show']);
    Route::patch('/calendars/{calendar}', [CalendarController::class, 'update']);
    Route::delete('/calendars/{calendar}', [CalendarController::class, 'destroy']);

    Route::get('/calendars/{calendar}/events', [EventController::class, 'index']);
    Route::post('/calendars/{calendar}/events', [EventController::class, 'store']);
    Route::get('/events/{event}', [EventController::class, 'show']);
    Route::patch('/events/{event}', [EventController::class, 'update']);
    Route::delete('/events/{event}', [EventController::class, 'destroy']);
});
