<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdatePasswordRequest;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): Response
    {
        $data = $request->only(['email', 'password']);

        $user = User::create([
            'email' => $data['email'] ?? null,
            'password' => password_hash($data['password'], PASSWORD_DEFAULT)
        ]);

        return response([
            'user'  => $user,
            'token' => $user->createToken('token')->plainTextToken,
        ], 201);
    }

    public function login(LoginRequest $request): Response
    {
        $credentials = $request->only(['email', 'password']);

        /** @var \App\Models\User $user */
        $user = User::where('email', $credentials['email'])->first();

        if ($user && $user->blocked_until && $user->blocked_until->isFuture()) {
            return response(
                ['message' => 'Your account is temporarily blocked. Please try again later.'],
                401
            );
        }

        if (!$user || !password_verify($request->password, $user->password)) {
            if ($user) {
                $failed_login_limit = 5;
                $user->failed_login_attempts++;

                if ($user->failed_login_attempts >= $failed_login_limit) {
                    $user->blocked_until = now()->addHours(4);
                }

                $user->save();
            }

            return response([
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        $user->update([
            'failed_login_attempts' => 0,
            'blocked_until'         => null,
        ]);

        $response = [
            'user' => $user,
            'token' => $user->createToken($request->email)->plainTextToken
        ];
        return response($response, 201);
    }

    public function logout(Request $request): Response
    {
        $request->user()->tokens()->delete();

        return response([
            'message' => 'Tokens Revoked'
        ], 200);
    }

    /**
     * Update the authenticated user’s password.
     */
    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $user->tokens()->delete();
        $user->password = password_hash($request->input('new_password'), PASSWORD_DEFAULT);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully.',
        ], 200);
    }
}
