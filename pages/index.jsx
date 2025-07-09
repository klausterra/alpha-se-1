import Layout from "./Layout.jsx";

import Home from "./Home";

import Anuncios from "./Anuncios";

import CriarAnuncio from "./CriarAnuncio";

import Admin from "./Admin";

import Perfil from "./Perfil";

import AnuncioDetalhes from "./AnuncioDetalhes";

import Chat from "./Chat";

import Conversas from "./Conversas";

import PoliticaPrivacidade from "./PoliticaPrivacidade";

import TermosDeServico from "./TermosDeServico";

import InfluencerDashboard from "./InfluencerDashboard";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Anuncios: Anuncios,
    
    CriarAnuncio: CriarAnuncio,
    
    Admin: Admin,
    
    Perfil: Perfil,
    
    AnuncioDetalhes: AnuncioDetalhes,
    
    Chat: Chat,
    
    Conversas: Conversas,
    
    PoliticaPrivacidade: PoliticaPrivacidade,
    
    TermosDeServico: TermosDeServico,
    
    InfluencerDashboard: InfluencerDashboard,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Anuncios" element={<Anuncios />} />
                
                <Route path="/CriarAnuncio" element={<CriarAnuncio />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/Perfil" element={<Perfil />} />
                
                <Route path="/AnuncioDetalhes" element={<AnuncioDetalhes />} />
                
                <Route path="/Chat" element={<Chat />} />
                
                <Route path="/Conversas" element={<Conversas />} />
                
                <Route path="/PoliticaPrivacidade" element={<PoliticaPrivacidade />} />
                
                <Route path="/TermosDeServico" element={<TermosDeServico />} />
                
                <Route path="/InfluencerDashboard" element={<InfluencerDashboard />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}