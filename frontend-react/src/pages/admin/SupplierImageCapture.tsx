import { AppstoreOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

type SupplierImageCaptureProps = {
  previewUrl: string | null;
  onUpload: (file: File) => Promise<void> | void;
  onClear: () => void;
};

export function SupplierImageCapture({ previewUrl, onUpload, onClear }: SupplierImageCaptureProps) {
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(previewUrl);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewObjectUrlRef = useRef<string | null>(null);

  async function isValidImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      return false;
    }

    const objectUrl = URL.createObjectURL(file);
    try {
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth || 0, height: image.naturalHeight || 0 });
        image.onerror = () => reject(new Error("Imagem invalida."));
        image.src = objectUrl;
      });

      return dimensions.width > 1 && dimensions.height > 1;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  useEffect(() => {
    setLocalPreviewUrl(previewUrl);
  }, [previewUrl]);

  useEffect(
    () => () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }
    },
    [],
  );

  useEffect(
    () => () => {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    },
    [],
  );

  useEffect(() => {
    if (!cameraAtiva || !cameraStreamRef.current || !videoRef.current) {
      return;
    }

    videoRef.current.srcObject = cameraStreamRef.current;
    void videoRef.current.play().catch(() => undefined);
  }, [cameraAtiva]);

  async function handleSelectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!(await isValidImageFile(file))) {
      message.warning("A imagem selecionada parece vazia ou muito pequena. Selecione outra imagem.");
      event.target.value = "";
      return;
    }

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;
    setLocalPreviewUrl(objectUrl);
    await onUpload(file);
    event.target.value = "";
  }

  async function handleStartCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      cameraStreamRef.current = stream;
      setCameraAtiva(true);
    } catch (error) {
      console.error("Erro ao iniciar camera:", error);
    }
  }

  function handleCancelCamera() {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraAtiva(false);
  }

  function handleCapturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    const captureWidth = video.videoWidth || 640;
    const captureHeight = video.videoHeight || 480;

    if (captureWidth <= 1 || captureHeight <= 1) {
      message.warning("Nao foi possivel capturar uma imagem valida da camera.");
      return;
    }

    canvas.width = captureWidth;
    canvas.height = captureHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        handleCancelCamera();
        return;
      }

      const capturedFile = new File([blob], "captura-camera.png", { type: "image/png" });
      if (capturedFile.size <= 100) {
        message.warning("A captura da camera ficou vazia. Tente novamente.");
        handleCancelCamera();
        return;
      }
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
      previewObjectUrlRef.current = URL.createObjectURL(capturedFile);
      setLocalPreviewUrl(previewObjectUrlRef.current);
      void onUpload(capturedFile);
      handleCancelCamera();
    }, "image/png");
  }

  return (
    <aside className="supplier-avatar-panel">
      <div className="supplier-avatar-box supplier-image-preview">
        {cameraAtiva ? (
          <video ref={videoRef} autoPlay playsInline muted className="supplier-image-video" />
        ) : localPreviewUrl ? (
          <img src={localPreviewUrl} alt="Preview do fornecedor" />
        ) : (
          <AppstoreOutlined />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(event) => void handleSelectFile(event)}
        className="supplier-image-input"
        style={{ display: "none" }}
      />

      <div className="supplier-image-actions">
        <Button onClick={() => inputRef.current?.click()}>Selecionar imagem</Button>
        <Button onClick={() => void handleStartCamera()}>Usar câmera</Button>
        {localPreviewUrl ? <Button onClick={onClear}>Remover imagem</Button> : null}
      </div>

      {cameraAtiva ? (
        <div className="supplier-image-actions">
          <Button type="primary" onClick={handleCapturePhoto}>
            Capturar foto
          </Button>
          <Button onClick={handleCancelCamera}>Cancelar câmera</Button>
        </div>
      ) : null}
      <canvas ref={canvasRef} className="supplier-image-canvas" aria-hidden="true" />
    </aside>
  );
}
