<?php

use App\Enums\EmployeeStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();

            $table->string('employee_code')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('display_name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable()->unique();
            $table->string('designation')->nullable();
            $table->string('department')->nullable();
            $table->string('status')->default(EmployeeStatus::Active->value)->index();
            $table->date('joined_date')->nullable();
            $table->text('notes')->nullable();

            $table->foreignId('user_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->boolean('is_salesperson')->default(false)->index();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
