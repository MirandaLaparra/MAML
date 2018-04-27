import React from 'react';
import ReactDOM from 'react-dom';
import * as firebase from 'firebase';
import * as request from 'superagent';
import {  BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'


import LoginFirebase from './FirebaseDB.jsx';


const USUARIODB = firebase.database().ref().child('usuarios')

class LoginForm extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      mensaje: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.checkLogin = this.checkLogin.bind(this);
  }
  checkSession(){
    return sessionStorage.getItem("Session");
  }
  handleChange(event) {
    if(event.target.id == "email"){
      this.setState({email: event.target.value});
    }
    if(event.target.id == "password"){
        this.setState({password: event.target.value});
    }
  }
  checkLogin(event) {
    event.preventDefault();

    let email = this.state.email.toLowerCase()
    let emailId = email.replace(/[^a-zA-Z 0-9.]+/g,'').replace(/\./g,'');
    let password = this.state.password;
    let mensajeLogin = '';

    USUARIODB.child(emailId).once('value', function(snapshot) {
    let userData = snapshot.val();
      if (userData !== null) {

        console.log ('Email correcto: ' + userData.email)
        if (userData.password == password){
          mensajeLogin = "Iniciando Sesión";
          sessionStorage.setItem("Session", email);
        }else{
          mensajeLogin = 'Contraseña incorrecta';
        }
      }else{
        mensajeLogin = "El usuario " +email + " no existe";
      }
    });
    this.setState({mensaje : mensajeLogin});
    console.log(mensajeLogin)
  }

  render(){
    if (this.checkSession()){
      return <Redirect to='/tienda'/>
    }
      return(
        <div className="login row">
          <div className="col s6 form-container animated fadeIn slow">
            <form onSubmit={this.checkLogin}>
              <h4 className="text-center white-text">Inicia Sesión</h4>
              <div className="col s12 input-field">
                <input type="email" ref="email" id="email" value={this.state.email} onChange={this.handleChange} placeholder="luis@email.com" className="validate white-text" required aria-required="true" />
                <label htmlFor="email" data-error="Error en formato de email. Ejemplo: luis@email.com" data-success="Formato de email correcto">Correo Electrónico</label>
              </div>
              <div className="col s12 input-field">
                <input type="password" ref="password" id="password" value={this.state.password} onChange={this.handleChange} placeholder="12345" className="validate  white-text" required aria-required="true" />
                <label htmlFor="password" data-error="Contraseña no puede ser vacía" className="white-text">Contraseña</label>
              </div>
              <div className="col s12 center-align">
                <div className="mensaje">
                {this.state.mensaje}
                </div>
                <button type="submit" className="btn btn-success" >Ingresar</button>
              </div>
            </form>
          </div>
        </div>
     );
    }

}
export default LoginForm;
