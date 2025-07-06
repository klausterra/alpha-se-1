import React from 'react';

export default function GoogleDriveViewer({ fileUrl, width = '100%', height = '600px' }) {
  if (!fileUrl) {
    return (
        <div className="flex items-center justify-center bg-gray-100 text-gray-500 p-4 rounded border" style={{ width, height }}>
            Nenhum arquivo para exibir.
        </div>
    );
  }

  // Detecta se é uma imagem pela extensão do arquivo
  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileUrl.split('?')[0]);

  console.log('GoogleDriveViewer - URL:', fileUrl, 'isImage:', isImage);

  if (isImage) {
    // Para imagens, usa a tag img nativa
    return (
      <div className="relative bg-gray-50 rounded border overflow-hidden" style={{ width, height }}>
        <img
          src={fileUrl}
          alt="Documento"
          className="w-full h-full object-contain"
          onLoad={() => console.log('Imagem carregada com sucesso')}
          onError={(e) => {
            console.log('Erro ao carregar imagem:', fileUrl);
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div 
          className="absolute inset-0 bg-red-50 border border-red-200 flex flex-col items-center justify-center text-red-700 p-4 text-center"
          style={{ display: 'none' }}
        >
          <p className="font-semibold mb-2">Erro ao carregar a imagem</p>
          <p className="text-sm mb-4">Não foi possível exibir o arquivo como imagem.</p>
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Clique aqui para abrir em nova aba
          </a>
        </div>
      </div>
    );
  } else {
    // Para PDFs e outros documentos, usa o Google Docs Viewer
    const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    
    console.log('GoogleDriveViewer - PDF URL:', viewerUrl);

    return (
      <div className="relative bg-gray-50 rounded border overflow-hidden" style={{ width, height }}>
        <iframe
          src={viewerUrl}
          className="w-full h-full border-none"
          allowFullScreen
          title="Visualizador de PDF"
          onLoad={() => console.log('PDF carregado com sucesso no Google Viewer')}
          onError={(e) => {
            console.log('Erro ao carregar PDF no Google Viewer:', fileUrl);
          }}
        />
        <noscript>
          <div className="absolute inset-0 bg-yellow-50 border border-yellow-200 flex flex-col items-center justify-center text-yellow-700 p-4 text-center">
            <p className="font-semibold mb-2">JavaScript necessário</p>
            <p className="text-sm mb-4">Não foi possível carregar o visualizador.</p>
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Clique aqui para baixar o arquivo
            </a>
          </div>
        </noscript>
      </div>
    );
  }
}