<?php

use App\Http\Controllers\EleveController;
use App\Http\Controllers\InscriptionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ParametreController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard/Index'))->name('dashboard');
});


Route::middleware(['auth'])->group(function () {
    Route::prefix('eleves')
        ->name('eleves.')
        ->group(function (): void {
            Route::get('/', [EleveController::class, 'index'])->name('index');

            Route::get('/create', [EleveController::class, 'create'])
                ->name('create');

            Route::post('/', [EleveController::class, 'store'])
                ->name('store');

            Route::get('/export/pdf', [EleveController::class, 'exportPdf'])->name('export.pdf');

            Route::get('/{id}', [EleveController::class, 'show'])->name('show');

            Route::get('/{id}/edit', [EleveController::class, 'edit'])
                ->name('edit');

            Route::put('/{id}', [EleveController::class, 'update'])
                ->name('update');

            Route::delete('/{id}', [EleveController::class, 'destroy'])
                ->name('destroy');

            Route::post('/{id}/transferer', [EleveController::class, 'transferer'])->name('transferer');
        });
});


Route::middleware(['auth'])->prefix('parametres')->name('parametres.')->group(function (): void {
    Route::get('/', [ParametreController::class, 'index'])->name('index');
    Route::patch('/general', [ParametreController::class, 'updateGeneral'])->name('general.update');
    Route::patch('/config/{onglet}', [ParametreController::class, 'updateConfig'])->name('config.update');
    Route::post('/annees', [ParametreController::class, 'storeAnnee'])->name('annees.store');
    Route::patch('/annees/{annee}/activer', [ParametreController::class, 'activateAnnee'])->name('annees.activate');
    Route::post('/periodes', [ParametreController::class, 'storePeriode'])->name('periodes.store');
    Route::post('/modes-paiement', [ParametreController::class, 'storeModePaiement'])->name('modes-paiement.store');
    Route::post('/statuts-inscription', [ParametreController::class, 'storeStatutInscription'])->name('statuts-inscription.store');
    Route::post('/roles', [ParametreController::class, 'storeRole'])->name('roles.store');
    Route::post('/permissions', [ParametreController::class, 'storePermission'])->name('permissions.store');
    Route::post('/modeles-impression', [ParametreController::class, 'storeModeleImpression'])->name('modeles-impression.store');
});

Route::middleware(['auth'])->prefix('inscriptions')->name('inscriptions.')->group(function (): void {
    Route::get('/', [InscriptionController::class, 'index'])->name('index');
    Route::get('/create', [InscriptionController::class, 'create'])->name('create');
    Route::post('/', [InscriptionController::class, 'store'])->name('store');
    Route::get('/{id}', [InscriptionController::class, 'show'])->name('show');
    Route::get('/{id}/edit', [InscriptionController::class, 'edit'])->name('edit');
    Route::put('/{id}', [InscriptionController::class, 'update'])->name('update');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
