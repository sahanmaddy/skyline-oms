<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EnsureCashCustomerSeeder extends Seeder
{
    /**
     * Ensure exactly one system Cash Customer exists (walk-in sales).
     */
    public function run(): void
    {
        DB::transaction(function () {
            $legacy = Customer::query()
                ->where('display_name', Customer::CASH_CUSTOMER_DISPLAY_NAME)
                ->where('customer_name', Customer::CASH_CUSTOMER_NAME)
                ->where('customer_code', '!=', Customer::CASH_CUSTOMER_CODE)
                ->first();

            if ($legacy) {
                $legacy->update(['customer_code' => Customer::CASH_CUSTOMER_CODE]);
            }

            Customer::query()->updateOrCreate(
                ['customer_code' => Customer::CASH_CUSTOMER_CODE],
                [
                    'display_name' => Customer::CASH_CUSTOMER_DISPLAY_NAME,
                    'customer_name' => Customer::CASH_CUSTOMER_NAME,
                    'company_name' => null,
                    'email' => null,
                    'credit_eligible' => false,
                    'credit_limit' => 0,
                    'status' => 'active',
                    'notes' => 'System default customer for walk-in cash sales.',
                ],
            );
        });
    }
}
