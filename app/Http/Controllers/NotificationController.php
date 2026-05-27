<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    /** Marque une notification comme lue et retourne le nouveau compteur. */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $notification = $user->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['unread_count' => $user->unreadNotifications()->count()]);
    }

    /** Marque toutes les notifications comme lues. */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['unread_count' => 0]);
    }

    /** Supprime une notification. */
    public function destroy(Request $request, string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $user->notifications()->findOrFail($id)->delete();

        return response()->json(['unread_count' => $user->unreadNotifications()->count()]);
    }

    /** Supprime toutes les notifications lues. */
    public function clearRead(Request $request): JsonResponse
    {
        $request->user()->readNotifications()->delete();

        return response()->json(['ok' => true]);
    }
}
