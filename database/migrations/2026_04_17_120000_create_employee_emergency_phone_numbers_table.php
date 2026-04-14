<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_emergency_phone_numbers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('phone_type', 32);
            $table->string('country_code', 10)->default('+94');
            $table->string('country_iso2', 2)->nullable();
            $table->string('phone_number');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->index(['employee_id', 'phone_type']);
        });

        $hasPhone = Schema::hasColumn('employees', 'emergency_contact_phone');
        $hasType = Schema::hasColumn('employees', 'emergency_contact_phone_type');

        if ($hasPhone) {
            $select = ['id', 'emergency_contact_phone'];
            if ($hasType) {
                $select[] = 'emergency_contact_phone_type';
            }

            foreach (DB::table('employees')->select($select)->cursor() as $row) {
                $raw = trim((string) ($row->emergency_contact_phone ?? ''));
                if ($raw === '') {
                    continue;
                }

                $digits = preg_replace('/\D+/', '', $raw) ?? '';
                if ($digits === '') {
                    continue;
                }

                $type = ($hasType && isset($row->emergency_contact_phone_type) && $row->emergency_contact_phone_type !== '')
                    ? (string) $row->emergency_contact_phone_type
                    : 'Mobile';

                if ($digits !== '' && str_starts_with($digits, '94') && strlen($digits) > 9) {
                    $digits = substr($digits, 2);
                }
                $digits = ltrim($digits, '0');
                if ($digits === '') {
                    continue;
                }

                DB::table('employee_emergency_phone_numbers')->insert([
                    'employee_id' => $row->id,
                    'phone_type' => $type,
                    'country_code' => '+94',
                    'country_iso2' => 'LK',
                    'phone_number' => $digits,
                    'is_primary' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        Schema::table('employees', function (Blueprint $table) {
            if (Schema::hasColumn('employees', 'emergency_contact_phone')) {
                $table->dropColumn('emergency_contact_phone');
            }
            if (Schema::hasColumn('employees', 'emergency_contact_phone_type')) {
                $table->dropColumn('emergency_contact_phone_type');
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_emergency_phone_numbers');

        Schema::table('employees', function (Blueprint $table) {
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_person');
            $table->string('emergency_contact_phone_type', 32)->nullable()->after('emergency_contact_phone');
        });
    }
};
