<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Seed default categories for new user
        $this->seedDefaultCategories($user);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    private function seedDefaultCategories(User $user)
    {
        $categories = [
            ['name' => 'Food & Dining',    'icon' => '🍔', 'color' => '#f97316', 'type' => 'expense'],
            ['name' => 'Transport',        'icon' => '🚗', 'color' => '#3b82f6', 'type' => 'expense'],
            ['name' => 'Shopping',         'icon' => '🛍️', 'color' => '#ec4899', 'type' => 'expense'],
            ['name' => 'Utilities',        'icon' => '💡', 'color' => '#eab308', 'type' => 'expense'],
            ['name' => 'Health',           'icon' => '💊', 'color' => '#22c55e', 'type' => 'expense'],
            ['name' => 'Entertainment',    'icon' => '🎮', 'color' => '#a855f7', 'type' => 'expense'],
            ['name' => 'Education',        'icon' => '📚', 'color' => '#06b6d4', 'type' => 'expense'],
            ['name' => 'Rent / Housing',   'icon' => '🏠', 'color' => '#ef4444', 'type' => 'expense'],
            ['name' => 'Salary',           'icon' => '💼', 'color' => '#10b981', 'type' => 'income'],
            ['name' => 'Freelance',        'icon' => '💻', 'color' => '#6366f1', 'type' => 'income'],
            ['name' => 'Investment',       'icon' => '📈', 'color' => '#14b8a6', 'type' => 'income'],
            ['name' => 'Other Income',     'icon' => '🎁', 'color' => '#f59e0b', 'type' => 'income'],
        ];

        foreach ($categories as $cat) {
            Category::create(array_merge($cat, ['user_id' => $user->id]));
        }
    }
}
