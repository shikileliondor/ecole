<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class AppNotification extends Notification
{
    public function __construct(
        private readonly string $notifType,
        private readonly string $title,
        private readonly string $message,
        private readonly string $link = '',
        private readonly array  $meta  = [],
    ) {}

    /** @param mixed $notifiable */
    public function via($notifiable): array
    {
        return ['database'];
    }

    /** @param mixed $notifiable */
    public function toDatabase($notifiable): array
    {
        return [
            'type'    => $this->notifType,
            'title'   => $this->title,
            'message' => $this->message,
            'link'    => $this->link,
            'meta'    => $this->meta,
        ];
    }

    /**
     * Envoie la notification à tous les membres du personnel d'un établissement.
     * Limite à 30 utilisateurs pour éviter les pics de charge.
     */
    public static function notifyStaff(int $etablissementId, self $notification): void
    {
        \App\Models\User::query()
            ->where('etablissement_id', $etablissementId)
            ->staff()
            ->actifs()
            ->limit(30)
            ->get()
            ->each(fn ($user) => $user->notify($notification));
    }
}
