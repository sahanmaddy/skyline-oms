<?php

use App\Models\UnitOfMeasure;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Strip leading zeros from UOM-* numeric suffixes (UOM-003 → UOM-3).
     */
    public function up(): void
    {
        $rows = UnitOfMeasure::query()->orderBy('id')->get(['id', 'unit_code']);

        $idToNew = [];
        foreach ($rows as $row) {
            if (preg_match('/^UOM-(\d+)$/', $row->unit_code, $m)) {
                $newCode = 'UOM-'.(int) $m[1];
                if ($newCode !== $row->unit_code) {
                    $idToNew[$row->id] = $newCode;
                }
            }
        }

        if ($idToNew === []) {
            return;
        }

        $grouped = [];
        foreach ($idToNew as $id => $newCode) {
            $grouped[$newCode][] = $id;
        }
        foreach ($grouped as $newCode => $ids) {
            if (count($ids) > 1) {
                throw new \RuntimeException(
                    "Cannot normalize UOM-: duplicate code [{$newCode}] for ids [".implode(', ', $ids).']. Resolve manually.',
                );
            }
        }

        foreach (array_keys($idToNew) as $id) {
            DB::table('unit_of_measures')->where('id', $id)->update(['unit_code' => 'UOM-__tmp__'.$id]);
        }

        foreach ($idToNew as $id => $newCode) {
            DB::table('unit_of_measures')->where('id', $id)->update(['unit_code' => $newCode]);
        }
    }
};
