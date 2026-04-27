<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (! Schema::hasColumn('customers', 'state_province')) {
                $table->string('state_province', 120)->nullable()->after('city');
            }
            if (! Schema::hasColumn('customers', 'postal_code')) {
                $table->string('postal_code', 40)->nullable()->after('state_province');
            }
        });

        Schema::table('branches', function (Blueprint $table) {
            if (! Schema::hasColumn('branches', 'state_province')) {
                $table->string('state_province', 120)->nullable()->after('city');
            }
            if (! Schema::hasColumn('branches', 'postal_code')) {
                $table->string('postal_code', 40)->nullable()->after('state_province');
            }
        });

        Schema::table('employees', function (Blueprint $table) {
            if (! Schema::hasColumn('employees', 'state_province')) {
                $table->string('state_province', 120)->nullable()->after('city');
            }
            if (! Schema::hasColumn('employees', 'postal_code')) {
                $table->string('postal_code', 40)->nullable()->after('state_province');
            }
        });

        Schema::table('company_settings', function (Blueprint $table) {
            if (! Schema::hasColumn('company_settings', 'address_line_1')) {
                $table->string('address_line_1')->nullable()->after('registered_address');
            }
            if (! Schema::hasColumn('company_settings', 'address_line_2')) {
                $table->string('address_line_2')->nullable()->after('address_line_1');
            }
            if (! Schema::hasColumn('company_settings', 'city')) {
                $table->string('city', 120)->nullable()->after('address_line_2');
            }
            if (! Schema::hasColumn('company_settings', 'state_province')) {
                $table->string('state_province', 120)->nullable()->after('city');
            }
            if (! Schema::hasColumn('company_settings', 'postal_code')) {
                $table->string('postal_code', 40)->nullable()->after('state_province');
            }
            if (! Schema::hasColumn('company_settings', 'country')) {
                $table->string('country', 120)->nullable()->after('postal_code');
            }
        });

        if (Schema::hasColumn('customers', 'district')) {
            DB::table('customers')
                ->whereNull('state_province')
                ->whereNotNull('district')
                ->update(['state_province' => DB::raw('district')]);

            Schema::table('customers', function (Blueprint $table) {
                $table->dropColumn('district');
            });
        }

        $companySettings = DB::table('company_settings')
            ->select(['id', 'registered_address', 'address_line_1', 'address_line_2', 'city', 'country'])
            ->get();

        foreach ($companySettings as $setting) {
            $lines = array_values(array_filter(array_map(
                static fn (string $line): string => trim($line),
                preg_split('/\r\n|\r|\n/', (string) ($setting->registered_address ?? '')) ?: []
            )));

            $addressLine1 = $setting->address_line_1 ?: ($lines[0] ?? null);
            $addressLine2 = $setting->address_line_2 ?: ($lines[1] ?? null);
            $city = $setting->city ?: ($lines[2] ?? null);
            $country = $setting->country ?: ($lines[3] ?? null);

            DB::table('company_settings')
                ->where('id', $setting->id)
                ->update([
                    'address_line_1' => $addressLine1,
                    'address_line_2' => $addressLine2,
                    'city' => $city,
                    'country' => $country,
                ]);
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('customers', 'district')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->string('district')->nullable()->after('city');
            });
        }

        if (Schema::hasColumn('customers', 'state_province')) {
            DB::table('customers')
                ->whereNull('district')
                ->whereNotNull('state_province')
                ->update(['district' => DB::raw('state_province')]);
        }

        Schema::table('customers', function (Blueprint $table) {
            if (Schema::hasColumn('customers', 'postal_code')) {
                $table->dropColumn('postal_code');
            }
            if (Schema::hasColumn('customers', 'state_province')) {
                $table->dropColumn('state_province');
            }
        });

        Schema::table('branches', function (Blueprint $table) {
            if (Schema::hasColumn('branches', 'postal_code')) {
                $table->dropColumn('postal_code');
            }
            if (Schema::hasColumn('branches', 'state_province')) {
                $table->dropColumn('state_province');
            }
        });

        Schema::table('employees', function (Blueprint $table) {
            if (Schema::hasColumn('employees', 'postal_code')) {
                $table->dropColumn('postal_code');
            }
            if (Schema::hasColumn('employees', 'state_province')) {
                $table->dropColumn('state_province');
            }
        });

        Schema::table('company_settings', function (Blueprint $table) {
            if (Schema::hasColumn('company_settings', 'country')) {
                $table->dropColumn('country');
            }
            if (Schema::hasColumn('company_settings', 'postal_code')) {
                $table->dropColumn('postal_code');
            }
            if (Schema::hasColumn('company_settings', 'state_province')) {
                $table->dropColumn('state_province');
            }
            if (Schema::hasColumn('company_settings', 'city')) {
                $table->dropColumn('city');
            }
            if (Schema::hasColumn('company_settings', 'address_line_2')) {
                $table->dropColumn('address_line_2');
            }
            if (Schema::hasColumn('company_settings', 'address_line_1')) {
                $table->dropColumn('address_line_1');
            }
        });
    }
};

