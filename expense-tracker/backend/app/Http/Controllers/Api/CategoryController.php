<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::where('user_id', $request->user()->id)
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'icon'  => 'required|string|max:10',
            'color' => 'required|string|max:20',
            'type'  => 'required|in:income,expense',
        ]);

        $category = Category::create([
            'user_id' => $request->user()->id,
            'name'    => $request->name,
            'icon'    => $request->icon,
            'color'   => $request->color,
            'type'    => $request->type,
        ]);

        return response()->json($category, 201);
    }

    public function update(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'name'  => 'sometimes|string|max:255',
            'icon'  => 'sometimes|string|max:10',
            'color' => 'sometimes|string|max:20',
            'type'  => 'sometimes|in:income,expense',
        ]);

        $category->update($request->only(['name', 'icon', 'color', 'type']));

        return response()->json($category);
    }

    public function destroy(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $category->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
