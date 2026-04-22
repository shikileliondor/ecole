<?php

use App\Http\Controllers\EleveController;
use App\Http\Controllers\InscriptionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ParametreController;
use App\Http\Controllers\ClasseController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
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
            Route::get('/export/word', [EleveController::class, 'exportWord'])->name('export.word');
            Route::get('/export/excel', [EleveController::class, 'exportExcel'])->name('export.excel');

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
    Route::delete('/annees/{annee}', [ParametreController::class, 'destroyAnnee'])->name('annees.destroy');
    Route::patch('/annees/{annee}/activer', [ParametreController::class, 'activateAnnee'])->name('annees.activate');
    Route::patch('/annees/{annee}/cloturer', [ParametreController::class, 'closeAnnee'])->name('annees.close');
    Route::patch('/annees/{annee}/rouvrir', [ParametreController::class, 'reopenAnnee'])->name('annees.reopen');
    Route::post('/periodes', [ParametreController::class, 'storePeriode'])->name('periodes.store');
    Route::delete('/periodes/{periode}', [ParametreController::class, 'destroyPeriode'])->name('periodes.destroy');
    Route::post('/niveaux', [ParametreController::class, 'storeNiveau'])->name('niveaux.store');
    Route::patch('/niveaux/{niveau}', [ParametreController::class, 'updateNiveau'])->name('niveaux.update');
    Route::delete('/niveaux/{niveau}', [ParametreController::class, 'destroyNiveau'])->name('niveaux.destroy');
    Route::post('/classes', [ParametreController::class, 'storeClasse'])->name('classes.store');
    Route::patch('/classes/{classe}', [ParametreController::class, 'updateClasse'])->name('classes.update');
    Route::delete('/classes/{classe}', [ParametreController::class, 'destroyClasse'])->name('classes.destroy');
    Route::post('/matieres', [ParametreController::class, 'storeMatiere'])->name('matieres.store');
    Route::patch('/matieres/{matiere}', [ParametreController::class, 'updateMatiere'])->name('matieres.update');
    Route::delete('/matieres/{matiere}', [ParametreController::class, 'destroyMatiere'])->name('matieres.destroy');
    Route::post('/modes-paiement', [ParametreController::class, 'storeModePaiement'])->name('modes-paiement.store');
    Route::delete('/modes-paiement/{modePaiement}', [ParametreController::class, 'destroyModePaiement'])->name('modes-paiement.destroy');
    Route::post('/types-frais', [ParametreController::class, 'storeTypeFrais'])->name('types-frais.store');
    Route::delete('/types-frais/{typeFrais}', [ParametreController::class, 'destroyTypeFrais'])->name('types-frais.destroy');
    Route::post('/statuts-inscription', [ParametreController::class, 'storeStatutInscription'])->name('statuts-inscription.store');
    Route::delete('/statuts-inscription/{statutInscription}', [ParametreController::class, 'destroyStatutInscription'])->name('statuts-inscription.destroy');
    Route::post('/roles', [ParametreController::class, 'storeRole'])->name('roles.store');
    Route::delete('/roles/{role}', [ParametreController::class, 'destroyRole'])->name('roles.destroy');
    Route::post('/permissions', [ParametreController::class, 'storePermission'])->name('permissions.store');
    Route::delete('/permissions/{permission}', [ParametreController::class, 'destroyPermission'])->name('permissions.destroy');
    Route::post('/modeles-impression', [ParametreController::class, 'storeModeleImpression'])->name('modeles-impression.store');
    Route::delete('/modeles-impression/{modeleImpression}', [ParametreController::class, 'destroyModeleImpression'])->name('modeles-impression.destroy');
});


Route::middleware(['auth'])->prefix('classes')->name('classes.')->group(function (): void {
    Route::get('/', [ClasseController::class, 'index'])->name('index');
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
