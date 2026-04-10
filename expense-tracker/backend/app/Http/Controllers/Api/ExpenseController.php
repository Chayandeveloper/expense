<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with('category')
            ->where('user_id', $request->user()->id);

        if ($request->filled('month') && $request->filled('year')) {
            $query->where('month', $request->month)
                  ->where('year', $request->year);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $expenses = $query->orderBy('date', 'desc')->get();

        return response()->json($expenses);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount'      => 'required|numeric|min:0.01',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'type'        => 'required|in:income,expense',
            'date'        => 'required|date',
        ]);

        $date = \Carbon\Carbon::parse($request->date);

        $expense = Expense::create([
            'user_id'     => $request->user()->id,
            'category_id' => $request->category_id,
            'amount'      => $request->amount,
            'title'       => $request->title,
            'description' => $request->description,
            'type'        => $request->type,
            'date'        => $request->date,
            'month'       => $date->month,
            'year'        => $date->year,
        ]);

        return response()->json($expense->load('category'), 201);
    }

    public function show(Request $request, Expense $expense)
    {
        if ($expense->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return response()->json($expense->load('category'));
    }

    public function update(Request $request, Expense $expense)
    {
        if ($expense->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'amount'      => 'sometimes|numeric|min:0.01',
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type'        => 'sometimes|in:income,expense',
            'date'        => 'sometimes|date',
        ]);

        $data = $request->only(['category_id', 'amount', 'title', 'description', 'type', 'date']);

        if (isset($data['date'])) {
            $date = \Carbon\Carbon::parse($data['date']);
            $data['month'] = $date->month;
            $data['year']  = $date->year;
        }

        $expense->update($data);

        return response()->json($expense->load('category'));
    }

    public function destroy(Request $request, Expense $expense)
    {
        if ($expense->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $expense->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    public function summary(Request $request)
    {
        $userId = $request->user()->id;
        $year   = $request->get('year', now()->year);

        $monthly = [];

        for ($m = 1; $m <= 12; $m++) {
            $income = Expense::where('user_id', $userId)
                ->where('year', $year)
                ->where('month', $m)
                ->where('type', 'income')
                ->sum('amount');

            $expense = Expense::where('user_id', $userId)
                ->where('year', $year)
                ->where('month', $m)
                ->where('type', 'expense')
                ->sum('amount');

            $monthly[] = [
                'month'   => $m,
                'income'  => (float) $income,
                'expense' => (float) $expense,
                'balance' => (float) ($income - $expense),
            ];
        }

        // Category breakdown for selected month
        $month = $request->get('month', now()->month);

        $categoryBreakdown = Expense::with('category')
            ->selectRaw('category_id, type, SUM(amount) as total')
            ->where('user_id', $userId)
            ->where('month', $month)
            ->where('year', $year)
            ->groupBy('category_id', 'type')
            ->get()
            ->map(function ($item) {
                return [
                    'category' => $item->category,
                    'type'     => $item->type,
                    'total'    => (float) $item->total,
                ];
            });

        return response()->json([
            'monthly'            => $monthly,
            'category_breakdown' => $categoryBreakdown,
        ]);
    }
}
