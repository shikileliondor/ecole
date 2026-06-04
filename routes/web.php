<?php

use App\Http\Controllers\EleveController;
use App\Http\Controllers\InscriptionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmploiDuTempsController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\SmsController;
use App\Http\Controllers\ParametreController;
use App\Http\Controllers\ClasseController;
use App\Http\Controllers\NoteBulletinController;
use App\Http\Controllers\SmsTestController;
use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CommunicationSmsController;
use App\Http\Controllers\CommunicationEmailController;
use App\Http\Controllers\PersonnelController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('permission:dashboard.voir')->name('dashboard');
});


Route::middleware(['auth'])->group(function () {
    Route::prefix('eleves')
        ->name('eleves.')
        ->group(function (): void {
            Route::get('/', [EleveController::class, 'index'])->middleware('permission:eleves.voir')->name('index');

            Route::get('/create', [EleveController::class, 'create'])
                ->middleware('permission:eleves.creer')
                ->name('create');

            Route::post('/', [EleveController::class, 'store'])
                ->middleware('permission:eleves.creer')
                ->name('store');

            Route::get('/export/pdf', [EleveController::class, 'exportPdf'])->middleware('permission:eleves.exporter')->name('export.pdf');
            Route::get('/export/word', [EleveController::class, 'exportWord'])->middleware('permission:eleves.exporter')->name('export.word');
            Route::get('/export/excel', [EleveController::class, 'exportExcel'])->middleware('permission:eleves.exporter')->name('export.excel');

            Route::get('/{id}', [EleveController::class, 'show'])->middleware('permission:eleves.voir')->name('show');

            Route::get('/{id}/edit', [EleveController::class, 'edit'])
                ->middleware('permission:eleves.modifier')
                ->name('edit');

            Route::put('/{id}', [EleveController::class, 'update'])
                ->middleware('permission:eleves.modifier')
                ->name('update');

            Route::delete('/{id}', [EleveController::class, 'destroy'])
                ->middleware('permission:eleves.supprimer')
                ->name('destroy');

            Route::post('/{id}/transferer', [EleveController::class, 'transferer'])->middleware('permission:eleves.transferer')->name('transferer');
        });
});


Route::middleware(['auth'])->prefix('parametres')->name('parametres.')->group(function (): void {
    Route::get('/', [ParametreController::class, 'index'])->middleware('permission:parametres.voir')->name('index');
    Route::get('/logo', [ParametreController::class, 'logo'])->middleware('permission:parametres.voir')->name('logo');
    Route::patch('/general', [ParametreController::class, 'updateGeneral'])->middleware('permission:parametres.modifier')->name('general.update');
    Route::patch('/config/{onglet}', [ParametreController::class, 'updateConfig'])->middleware('permission:parametres.modifier')->name('config.update');
    Route::post('/annees', [ParametreController::class, 'storeAnnee'])->middleware('permission:parametres.academique.gerer')->name('annees.store');
    Route::delete('/annees/{annee}', [ParametreController::class, 'destroyAnnee'])->middleware('permission:parametres.academique.gerer')->name('annees.destroy');
    Route::patch('/annees/{annee}/activer', [ParametreController::class, 'activateAnnee'])->middleware('permission:parametres.academique.gerer')->name('annees.activate');
    Route::patch('/annees/{annee}/cloturer', [ParametreController::class, 'closeAnnee'])->middleware('permission:parametres.academique.gerer')->name('annees.close');
    Route::patch('/annees/{annee}/rouvrir', [ParametreController::class, 'reopenAnnee'])->middleware('permission:parametres.academique.gerer')->name('annees.reopen');
    Route::post('/periodes', [ParametreController::class, 'storePeriode'])->middleware('permission:parametres.academique.gerer')->name('periodes.store');
    Route::delete('/periodes/{periode}', [ParametreController::class, 'destroyPeriode'])->middleware('permission:parametres.academique.gerer')->name('periodes.destroy');
    Route::post('/niveaux', [ParametreController::class, 'storeNiveau'])->middleware('permission:parametres.academique.gerer')->name('niveaux.store');
    Route::patch('/niveaux/{niveau}', [ParametreController::class, 'updateNiveau'])->middleware('permission:parametres.academique.gerer')->name('niveaux.update');
    Route::delete('/niveaux/{niveau}', [ParametreController::class, 'destroyNiveau'])->middleware('permission:parametres.academique.gerer')->name('niveaux.destroy');
    Route::post('/classes', [ParametreController::class, 'storeClasse'])->middleware('permission:parametres.academique.gerer')->name('classes.store');
    Route::patch('/classes/{classe}', [ParametreController::class, 'updateClasse'])->middleware('permission:parametres.academique.gerer')->name('classes.update');
    Route::delete('/classes/{classe}', [ParametreController::class, 'destroyClasse'])->middleware('permission:parametres.academique.gerer')->name('classes.destroy');
    Route::post('/matieres', [ParametreController::class, 'storeMatiere'])->middleware('permission:parametres.academique.gerer')->name('matieres.store');
    Route::patch('/matieres/{matiere}', [ParametreController::class, 'updateMatiere'])->middleware('permission:parametres.academique.gerer')->name('matieres.update');
    Route::delete('/matieres/{matiere}', [ParametreController::class, 'destroyMatiere'])->middleware('permission:parametres.academique.gerer')->name('matieres.destroy');
    Route::post('/modes-paiement', [ParametreController::class, 'storeModePaiement'])->middleware('permission:parametres.academique.gerer')->name('modes-paiement.store');
    Route::delete('/modes-paiement/{modePaiement}', [ParametreController::class, 'destroyModePaiement'])->middleware('permission:parametres.academique.gerer')->name('modes-paiement.destroy');
    Route::post('/types-frais', [ParametreController::class, 'storeTypeFrais'])->middleware('permission:parametres.academique.gerer')->name('types-frais.store');
    Route::delete('/types-frais/{typeFrais}', [ParametreController::class, 'destroyTypeFrais'])->middleware('permission:parametres.academique.gerer')->name('types-frais.destroy');
    Route::post('/statuts-inscription', [ParametreController::class, 'storeStatutInscription'])->middleware('permission:parametres.academique.gerer')->name('statuts-inscription.store');
    Route::delete('/statuts-inscription/{statutInscription}', [ParametreController::class, 'destroyStatutInscription'])->middleware('permission:parametres.academique.gerer')->name('statuts-inscription.destroy');
    Route::post('/roles', [ParametreController::class, 'storeRole'])->middleware('permission:permissions.roles.gerer')->name('roles.store');
    Route::delete('/roles/{role}', [ParametreController::class, 'destroyRole'])->middleware('permission:permissions.roles.gerer')->name('roles.destroy');
    Route::post('/permissions', [ParametreController::class, 'storePermission'])->middleware('permission:permissions.creer')->name('permissions.store');
    Route::delete('/permissions/{permission}', [ParametreController::class, 'destroyPermission'])->middleware('permission:permissions.supprimer')->name('permissions.destroy');
    Route::post('/users', [ParametreController::class, 'storeUser'])->middleware('permission:permissions.utilisateurs.creer|permissions.utilisateurs.gerer')->name('users.store');
    Route::put('/users/{user}/permissions', [ParametreController::class, 'syncUserPermissions'])->middleware('permission:permissions.utilisateurs.permissions.gerer|permissions.utilisateurs.gerer')->name('users.permissions.sync');
    Route::post('/modeles-impression', [ParametreController::class, 'storeModeleImpression'])->middleware('permission:parametres.documents.gerer')->name('modeles-impression.store');
    Route::delete('/modeles-impression/{modeleImpression}', [ParametreController::class, 'destroyModeleImpression'])->middleware('permission:parametres.documents.gerer')->name('modeles-impression.destroy');
});



Route::middleware(['auth'])->prefix('notes-bulletins')->name('notes-bulletins.')->group(function (): void {
    Route::get('/', [NoteBulletinController::class, 'index'])->middleware('permission:notes.voir')->name('index');
    Route::post('/compositions', [NoteBulletinController::class, 'storeComposition'])->middleware('permission:notes.gerer')->name('compositions.store');
    Route::post('/compositions/{composition}/notes', [NoteBulletinController::class, 'storeNotes'])->middleware('permission:notes.gerer')->name('compositions.notes.store');
    Route::post('/compositions/{composition}/notes-eleves', [NoteBulletinController::class, 'storeEleveNotes'])->middleware('permission:notes.gerer')->name('compositions.notes-eleves.store');
    Route::get('/compositions/{composition}/export', [NoteBulletinController::class, 'exportComposition'])->middleware('permission:notes.exporter')->name('compositions.export');
});


Route::middleware(['auth'])->prefix('scolarite/emplois-du-temps')->name('emplois-du-temps.')->group(function (): void {
    Route::get('/', [EmploiDuTempsController::class, 'index'])->middleware('permission:emplois.voir')->name('index');
    Route::post('/', [EmploiDuTempsController::class, 'store'])->middleware('permission:emplois.gerer')->name('store');
    Route::patch('/{id}', [EmploiDuTempsController::class, 'update'])->middleware('permission:emplois.gerer')->name('update');
    Route::delete('/{id}', [EmploiDuTempsController::class, 'destroy'])->middleware('permission:emplois.gerer')->name('destroy');
});

Route::middleware(['auth'])->prefix('classes')->name('classes.')->group(function (): void {
    Route::get('/', [ClasseController::class, 'index'])->middleware('permission:classes.voir')->name('index');
});

Route::middleware(['auth'])->prefix('inscriptions')->name('inscriptions.')->group(function (): void {
    Route::get('/', [InscriptionController::class, 'index'])->middleware('permission:inscriptions.voir')->name('index');
    Route::get('/create', [InscriptionController::class, 'create'])->middleware('permission:inscriptions.creer')->name('create');
    Route::post('/', [InscriptionController::class, 'store'])->middleware('permission:inscriptions.creer')->name('store');
    Route::get('/{id}', [InscriptionController::class, 'show'])->middleware('permission:inscriptions.voir')->name('show');
    Route::get('/{id}/edit', [InscriptionController::class, 'edit'])->middleware('permission:inscriptions.modifier')->name('edit');
    Route::put('/{id}', [InscriptionController::class, 'update'])->middleware('permission:inscriptions.modifier')->name('update');
});


Route::middleware(['auth'])->prefix('absences')->name('absences.')->group(function (): void {
    Route::get('/', [AbsenceController::class, 'index'])->middleware('permission:absences.voir')->name('index');
    Route::get('/create', [AbsenceController::class, 'create'])->middleware('permission:absences.creer')->name('create');
    Route::post('/', [AbsenceController::class, 'store'])->middleware('permission:absences.creer')->name('store');
    Route::get('/export/pdf', [AbsenceController::class, 'exportPdf'])->middleware('permission:absences.exporter')->name('export.pdf');
    Route::get('/export/excel', [AbsenceController::class, 'exportExcel'])->middleware('permission:absences.exporter')->name('export.excel');
    Route::get('/export/word', [AbsenceController::class, 'exportWord'])->middleware('permission:absences.exporter')->name('export.word');
    Route::patch('/{absence}', [AbsenceController::class, 'update'])->middleware('permission:absences.modifier')->name('update');
    Route::delete('/{absence}', [AbsenceController::class, 'destroy'])->middleware('permission:absences.supprimer')->name('destroy');
});

Route::middleware(['auth'])->prefix('personnel')->name('personnel.')->group(function (): void {
    Route::get('/', [PersonnelController::class, 'index'])->middleware('permission:personnel.voir')->name('index');
    Route::post('/', [PersonnelController::class, 'store'])->middleware('permission:personnel.creer')->name('store');
    Route::match(['post', 'patch'], '/{personnel}', [PersonnelController::class, 'update'])->middleware('permission:personnel.modifier')->name('update');
    Route::delete('/{personnel}', [PersonnelController::class, 'destroy'])->middleware('permission:personnel.supprimer')->name('destroy');
});

Route::middleware(['auth'])->prefix('finances')->name('finances.')->group(function (): void {
    Route::get('/dashboard', [FinanceController::class, 'dashboard'])->middleware('permission:finances.voir')->name('dashboard');
    Route::get('/paiements', [FinanceController::class, 'paiements'])->middleware('permission:finances.paiements.gerer')->name('paiements');
    Route::get('/impayes', [FinanceController::class, 'impayes'])->middleware('permission:finances.paiements.gerer')->name('impayes');
    Route::post('/paiements', [FinanceController::class, 'storePaiement'])->middleware('permission:finances.paiements.gerer')->name('paiements.store');
    Route::put('/paiements/{paiement}', [FinanceController::class, 'updatePaiement'])->middleware('permission:finances.paiements.gerer')->name('paiements.update');
    Route::post('/paiements/{paiement}/annulation', [FinanceController::class, 'annulerPaiement'])->middleware('permission:finances.paiements.annuler')->name('paiements.cancel');
    Route::get('/depenses', [FinanceController::class, 'depenses'])->middleware('permission:finances.depenses.gerer')->name('depenses');
    Route::post('/depenses', [FinanceController::class, 'storeDepense'])->middleware('permission:finances.depenses.gerer')->name('depenses.store');
    Route::put('/depenses/{depense}', [FinanceController::class, 'updateDepense'])->middleware('permission:finances.depenses.gerer')->name('depenses.update');
    Route::delete('/depenses/{depense}', [FinanceController::class, 'destroyDepense'])->middleware('permission:finances.depenses.gerer')->name('depenses.destroy');
    Route::get('/salaires', fn () => Inertia::render('Finances/Salaires'))->middleware('permission:finances.salaires.voir')->name('salaires');
    Route::get('/rapports', [\App\Http\Controllers\RapportController::class, 'index'])->middleware('permission:finances.rapports.voir')->name('rapports.index');
    Route::get('/rapports-financiers', fn () => Inertia::render('Finances/Rapports'))->middleware('permission:finances.rapports.voir')->name('rapports.financiers');
});


Route::middleware(['auth'])->prefix('api')->name('api.')->group(function (): void {
    Route::post('/sms/send', [SmsController::class, 'send'])->middleware('permission:communication.sms.gerer')->name('sms.send');
});


Route::middleware(['auth'])->prefix('sms')->name('sms.')->group(function (): void {
    Route::get('/test', [SmsTestController::class, 'create'])->middleware('permission:communication.sms.gerer')->name('test');
    Route::post('/test', [SmsTestController::class, 'store'])->middleware('permission:communication.sms.gerer')->name('test.store');
});


Route::middleware(['auth'])->prefix('communication')->name('communication.')->group(function (): void {
    Route::get('/sms', [CommunicationSmsController::class, 'index'])->middleware('permission:communication.sms.gerer')->name('sms.index');
    Route::post('/sms/send', [CommunicationSmsController::class, 'send'])->middleware('permission:communication.sms.gerer')->name('sms.send');
    Route::get('/email', [CommunicationEmailController::class, 'index'])->middleware('permission:communication.email.gerer')->name('email.index');
    Route::post('/email/send', [CommunicationEmailController::class, 'send'])->middleware('permission:communication.email.gerer')->name('email.send');
});

Route::middleware('auth')->prefix('notifications')->name('notifications.')->group(function (): void {
    Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])->middleware('permission:notifications.gerer')->name('read');
    Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])->middleware('permission:notifications.gerer')->name('read-all');
    Route::delete('/clear-read', [NotificationController::class, 'clearRead'])->middleware('permission:notifications.gerer')->name('clear-read');
    Route::delete('/{id}', [NotificationController::class, 'destroy'])->middleware('permission:notifications.gerer')->name('destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->middleware('permission:profile.modifier')->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->middleware('permission:profile.modifier')->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->middleware('permission:profile.modifier')->name('profile.destroy');
});

require __DIR__.'/auth.php';
