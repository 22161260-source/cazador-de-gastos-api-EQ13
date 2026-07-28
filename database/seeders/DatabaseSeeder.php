<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Recommendation;
use App\Models\Role;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin    = Role::create(['name' => 'admin',    'display_name' => 'Administrador', 'description' => 'Acceso total al sistema']);
        $advisor  = Role::create(['name' => 'advisor',  'display_name' => 'Asesor',        'description' => 'Visualización de reportes']);
        $standard = Role::create(['name' => 'standard', 'display_name' => 'Usuario',       'description' => 'Gestión de sus propios datos']);

        $adminUser = User::create([
            'name'      => 'Administrador Sistema',
            'email'     => 'admin@cazador.com',
            'password'  => Hash::make('Admin@12345'),
            'role_id'   => $admin->id,
            'phone'     => '+521234567890',
            'is_active' => true,
        ]);

        $advisorUser = User::create([
            'name'      => 'Ivonee Vargas',
            'email'     => 'advisor@cazador.com',
            'password'  => Hash::make('Advisor@12345'),
            'role_id'   => $advisor->id,
            'phone'     => '+529876543210',
            'is_active' => true,
        ]);

        $users = [];
        $userNames = [
            ['Manuel Matías',  'user@cazador.com',       '+521112223330'],
            ['Ana García',     'ana@cazador.com',         '+521112223331'],
            ['Carlos López',   'carlos@cazador.com',      '+521112223332'],
            ['María Torres',   'maria@cazador.com',       '+521112223333'],
            ['José Hernández', 'jose@cazador.com',        '+521112223334'],
            ['Lucía Ramírez',  'lucia@cazador.com',       '+521112223335'],
            ['Diego Sánchez',  'diego@cazador.com',       '+521112223336'],
            ['Sofía Mendoza',  'sofia@cazador.com',       '+521112223337'],
            ['Pedro Flores',   'pedro@cazador.com',       '+521112223338'],
            ['Valeria Cruz',   'valeria@cazador.com',     '+521112223339'],
        ];

        foreach ($userNames as [$name, $email, $phone]) {
            $users[] = User::create([
                'name'      => $name,
                'email'     => $email,
                'password'  => Hash::make('User@12345'),
                'role_id'   => $standard->id,
                'phone'     => $phone,
                'is_active' => true,
            ]);
        }

        $categories = [
            ['name' => 'Alimentación',       'icon' => '🍔', 'color' => '#f59e0b', 'type' => 'expense'],
            ['name' => 'Transporte',         'icon' => '🚗', 'color' => '#3b82f6', 'type' => 'expense'],
            ['name' => 'Entretenimiento',    'icon' => '🎬', 'color' => '#8b5cf6', 'type' => 'expense'],
            ['name' => 'Salud',              'icon' => '💊', 'color' => '#ef4444', 'type' => 'expense'],
            ['name' => 'Ropa y Accesorios',  'icon' => '👕', 'color' => '#ec4899', 'type' => 'expense'],
            ['name' => 'Educación',          'icon' => '📚', 'color' => '#06b6d4', 'type' => 'expense'],
            ['name' => 'Servicios',          'icon' => '💡', 'color' => '#f97316', 'type' => 'expense'],
            ['name' => 'Hogar',              'icon' => '🏠', 'color' => '#84cc16', 'type' => 'expense'],
            ['name' => 'Sueldo',             'icon' => '💼', 'color' => '#10b981', 'type' => 'income'],
            ['name' => 'Freelance',          'icon' => '💻', 'color' => '#6366f1', 'type' => 'income'],
            ['name' => 'Inversiones',        'icon' => '📈', 'color' => '#14b8a6', 'type' => 'income'],
            ['name' => 'Otros ingresos',     'icon' => '💰', 'color' => '#a3e635', 'type' => 'income'],
        ];

        $categoryModels = [];
        foreach ($categories as $cat) {
            $categoryModels[$cat['name']] = Category::create(array_merge($cat, ['is_system' => true]));
        }

        $tags = [
            Tag::create(['name' => 'urgente',    'color' => '#ef4444']),
            Tag::create(['name' => 'recurrente', 'color' => '#f59e0b']),
            Tag::create(['name' => 'capricho',   'color' => '#8b5cf6']),
            Tag::create(['name' => 'necesario',  'color' => '#10b981']),
            Tag::create(['name' => 'ahorrrable', 'color' => '#3b82f6']),
        ];

        $expenseCategories = ['Alimentación', 'Transporte', 'Entretenimiento', 'Salud', 'Ropa y Accesorios', 'Educación', 'Servicios', 'Hogar'];
        $incomeCategories  = ['Sueldo', 'Freelance', 'Inversiones', 'Otros ingresos'];

        foreach (array_slice($users, 0, 5) as $user) {
            $incomeDescriptions = [
                'Sueldo quincenal', 'Freelance diseño', 'Trabajo extra',
                'Transferencia familiar', 'Venta artículo', 'Bonificación',
                'Ingreso freelance web', 'Sueldo mensual', 'Comisión ventas',
                'Consultoría', 'Regalía proyecto', 'Dividendos',
            ];
            foreach ($incomeDescriptions as $i => $desc) {
                $catName = $incomeCategories[$i % count($incomeCategories)];
                Income::create([
                    'user_id'     => $user->id,
                    'category_id' => $categoryModels[$catName]->id,
                    'description' => $desc,
                    'amount'      => rand(3000, 25000),
                    'date'        => now()->subDays(rand(0, 180))->format('Y-m-d'),
                ]);
            }

            $expenseData = [
                ['OXXO - snacks',       false, 'Alimentación'],
                ['Uber a la oficina',   false, 'Transporte'],
                ['Netflix mensual',     true,  'Entretenimiento'],
                ['Medicamentos',        false, 'Salud'],
                ['Zapatos nuevos',      true,  'Ropa y Accesorios'],
                ['Spotify premium',     true,  'Entretenimiento'],
                ['Luz del mes',         false, 'Servicios'],
                ['Gasolina',            false, 'Transporte'],
                ['Comida rápida',       true,  'Alimentación'],
                ['Curso online',        false, 'Educación'],
                ['Supermercado',        false, 'Alimentación'],
                ['Cine y palomitas',    true,  'Entretenimiento'],
                ['Internet mes',        false, 'Servicios'],
                ['Ropa deportiva',      true,  'Ropa y Accesorios'],
                ['Mantenimiento auto',  false, 'Transporte'],
            ];

            foreach ($expenseData as [$desc, $unnecessary, $catName]) {
                $expense = Expense::create([
                    'user_id'        => $user->id,
                    'category_id'    => $categoryModels[$catName]->id,
                    'description'    => $desc,
                    'amount'         => rand(50, 2500),
                    'date'           => now()->subDays(rand(0, 90))->format('Y-m-d'),
                    'is_unnecessary' => $unnecessary,
                ]);

                $expense->tags()->attach(collect($tags)->random(rand(1, 2))->pluck('id'));
            }

            foreach (array_slice($expenseCategories, 0, 5) as $catName) {
                Budget::create([
                    'user_id'     => $user->id,
                    'category_id' => $categoryModels[$catName]->id,
                    'amount'      => rand(500, 5000),
                    'month'       => now()->month,
                    'year'        => now()->year,
                ]);
            }

            Alert::create([
                'user_id' => $user->id,
                'title'   => '⚠️ Superaste tu presupuesto de entretenimiento',
                'message' => 'Has gastado más del 80% de tu presupuesto mensual en entretenimiento.',
                'type'    => 'warning',
                'channel' => 'app',
            ]);

            Alert::create([
                'user_id'  => $user->id,
                'title'    => '💡 Tip de ahorro detectado',
                'message'  => 'Podrías ahorrar cancelando suscripciones que apenas usas.',
                'type'     => 'info',
                'channel'  => 'app',
            ]);

            Recommendation::create([
                'user_id'          => $user->id,
                'title'            => 'Cancela suscripciones no usadas',
                'message'          => 'Detectamos que tienes múltiples suscripciones de streaming. Considera cancelar las que menos usas.',
                'potential_saving' => 350,
                'priority'         => 'high',
            ]);

            Recommendation::create([
                'user_id'          => $user->id,
                'title'            => 'Reduce gastos en comida rápida',
                'message'          => 'Tus gastos en comida rápida son 3x más altos que el promedio. Cocinar en casa podría ahorrarte significativamente.',
                'potential_saving' => 800,
                'priority'         => 'medium',
            ]);
        }
    }
}

