<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

Route::get('/login', function () {
    return Inertia::render('login');
})->name('login');

Route::get('/logout', function () {
    return Inertia::render('logout');
})->name('logout');

Route::get('/register', function () {
    return Inertia::render('register');
})->name('register');

Route::get('/dashboard', function () {
    return Inertia::render('dashboard');
})->name('dashboard');
