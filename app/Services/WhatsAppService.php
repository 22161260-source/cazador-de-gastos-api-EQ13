<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class WhatsAppService
{
    private string $token;
    private string $phoneNumberId;

    public function __construct()
    {
        $this->token = env('META_WA_ACCESS_TOKEN');
        $this->phoneNumberId = env('META_WA_PHONE_NUMBER_ID');
    }

    public function sendWhatsApp(string $to, string $message): void
    {
        $toClean = str_replace('+', '', $to);

        $response = Http::withoutVerifying()
            ->withToken($this->token)
            ->post("https://graph.facebook.com/v19.0/{$this->phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'recipient_type'    => 'individual',
                'to'                => $toClean,
                'type'              => 'text',
                'text'              => [
                    'preview_url' => false,
                    'body'        => $message
                ]
            ]);

        if ($response->failed()) {
            throw new \Exception('Error de Meta: ' . $response->body());
        }
    }
}

