"use client";

import { QRCodeSVG } from "qrcode.react";

interface Props {
  value: string;
}

export function QrCodeClient({ value }: Props) {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <QRCodeSVG value={value} size={192} />
    </div>
  );
}

