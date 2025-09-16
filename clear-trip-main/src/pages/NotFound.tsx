import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound(){
  return (
    <div style={{minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16}}>
      <h1 style={{fontSize:48, margin:0}}>404</h1>
      <p style={{margin:0, opacity:0.7}}>Page introuvable (micro-app ClearTrip)</p>
      <Link to="/" style={{color:'#0d6efd', textDecoration:'underline'}}>Retour</Link>
    </div>
  );
}
