<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $rows = DB::table('branches')->orderBy('id')->get(['id', 'code']);

        foreach ($rows as $row) {
            if (! is_string($row->code) || ! preg_match('/^BR-0*(\d+)$/i', $row->code, $m)) {
                continue;
            }

            $newCode = 'BR-'.((int) $m[1]);

            if ($newCode === $row->code) {
                continue;
            }

            $exists = DB::table('branches')
                ->where('code', $newCode)
                ->where('id', '!=', $row->id)
                ->exists();

            if ($exists) {
                continue;
            }

            DB::table('branches')->where('id', $row->id)->update(['code' => $newCode]);
        }
    }

    public function down(): void
    {
        //
    }
};
