import React from 'react';
import { Redirect } from 'react-router-dom';
import * as firebase from 'firebase';

import BarraNavegacion from './BarraNavegacion.jsx';
import Catalogo from './Catalogo.jsx';


class Tienda extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      catalogo: [],
      productos: [],
      listaCarrito : [],
      loader : true
    }
    this.actualizarDisponible = this.actualizarDisponible.bind(this)
  }

  componentWillMount(){
      const listaProductos = []                                                 //Arreglo temporal de objetos para almacenar todos los productos
      firebase.database().ref("productos").once("value").then((snapshot) => {
        snapshot.forEach(function(childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          listaProductos.push(childData);
        });
        this.setState({catalogo : listaProductos });
        this.setState({productos : this.state.catalogo});
      })
  }

  render(){
  if(!sessionStorage.getItem('Session')){                                       //Verificar que exista sesion iniciada
    return <Redirect to="/" />
  }

    return(
    <div className="tienda row">
      <div className="container">
        <BarraNavegacion contador={this.contadorCarrito()}/>
        <div className="left lista-productos box">
          <div className="col s12 blue darken-1 animated fadeInDown fast">
            <h4 className="col m6 s12 white-text left ">Cátalogo de productos</h4>
            <h4 className="right col m6 s12 input-field">
            <i className="material-icons prefix white-text">search</i>
            <input onChange={this.filtrarCatalogo.bind(this)} type="text" id="descripcion" placeholder="aguacate"  type="text" className="white-text no-margin-bottom"/>
            <label htmlFor="descripcion" className="white-text">¿Qué estás buscando?</label>
            </h4>
          </div>
        {
          this.mostrarProductos()
        }
        </div>
      </div>
      </div>
    )
  }

    mostrarProductos(){
    return this.state.productos.map(                                            //Recorrer el arreglo de productos y devolver como respuesta la infirmación de cada uno
      (producto) => { return <Catalogo actualizarDisponible={this.actualizarDisponible} productos={this.state.productos} key={ producto.id } id={producto.id}  nombre={ producto.nombre } imagen={ producto.imagen } descripcion={ producto.descripcion } disponible={ producto.disponible } precio ={producto.precio} /> }
    )
  }

  filtrarCatalogo(event){
    this.state.productos = this.state.catalogo;             //Inicializar el catálogo de productos con la información de la base de datos
    let palabraFiltro = event.target.value.toLowerCase();   //Pasar la infromación a minúsculas para hacerlas coincidir con el parámetro nombre en la base de datos
    let itemMatch = [];                                     //Inicializar el arreglo de productos coincidentes

    for(let item of this.state.productos){                  //Recorrer el arreglo de productos en el Catalogo
      let nombre = item.nombre.toLowerCase();               //crear una variable para comparar los productos
      if(nombre.includes( palabraFiltro )){                 //Verificar que algún item del catálogo contenga los caracteres especificados en el campo de búsqueda
        itemMatch.push(item)}                               //Agregar el producto coincidente al arreglo
      }
      this.setState({productos : itemMatch});              //Actualizar el estado de listado de productos a los productos que tengasn alguna coincidencia con el campo de filtro
      if(itemMatch.length == 0){                           //Si la cantidad de objetos en el estado de la variable producto es 0 devolver un arreglo vacío
        this.state.productos = []
      }
    }
    actualizarDisponible(item, cantidad){
      for (let productoLista of this.state.productos){
        if (productoLista.id == item.id){
          this.verificarCarrito(item, cantidad)                                             
          productoLista.disponible = (Number(productoLista.disponible) - Number(cantidad))
          this.setState({productos : this.state.productos})
          this.setState({listaCarrito : this.state.listaCarrito})
        }
      }
    }

    verificarCarrito(item, cantidad){
      if(this.guardarCarrito(item, cantidad) == false){
        this.state.listaCarrito.push(item)
      }
      this.setState({listaCarrito : this.state.listaCarrito})
      sessionStorage.setItem("Carrito", JSON.stringify(this.state.listaCarrito));
    }

    guardarCarrito(item, cantidad){
      if(this.state.listaCarrito.length > 0){
        for(let itemGuardado of this.state.listaCarrito){
          if(itemGuardado.id == item.id){
            itemGuardado.cantidad = (Number(itemGuardado.cantidad) + Number(cantidad))
            return true
          }
        }
        return false;
      }
      return false;
    }

    itemsCarrito(){
      if(sessionStorage.getItem("Carrito")){
        this.state.listaCarrito = JSON.parse(sessionStorage.getItem("Carrito"));
        return JSON.parse(sessionStorage.getItem("Carrito"));
      }
      return 0;
    }

    contadorCarrito(){
      return this.itemsCarrito().length
    }
  }
  export default Tienda;
