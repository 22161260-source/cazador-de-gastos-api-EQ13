<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('icon')->nullable();       // emoji o nombre de icono
            $table->string('color', 7)->default('#6366f1'); // hex color
            $table->enum('type', ['expense', 'income', 'both'])->default('both');
            $table->boolean('is_system')->default(false); // categoría del sistema
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // null = categoría global
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};

