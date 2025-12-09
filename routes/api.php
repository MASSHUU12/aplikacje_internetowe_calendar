<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\CheckUserBlocked;

Route::post("/login", [AuthController::class, "login"]);
Route::post("/register", [AuthController::class, "register"]);

Route::group(["middleware" => ["auth:sanctum", CheckUserBlocked::class]], function () {
    Route::post("/logout", [AuthController::class, "logout"]);
    Route::patch("/user/password", [AuthController::class, "updatePassword"]);
});
