import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Touchable } from 'react-native';
import firebase from 'firebase';
import db from '../config';

import AppHeader from '../components/AppHeader';

export default class ExchangeScreen extends React.Component {

    constructor(){
        super();

        this.state = {
            userId: firebase.auth().currentUser.email,
            objectName: '',
            objectDescription: '',

            userDocId: '',

            docId: '',
            requestedObjectName: '',
            requestId: '',
            objectStatus: '',

            isBarterActive: ''
        }
    }


    getIsBarterActive = () => {
        db.collection('users')
        .where('email_id','==',this.state.userId)
        .get()
        .then( (snapshot)=>{
            snapshot.forEach( (doc)=>{

                this.setState({
                    isBarterActive: doc.data().is_barter_active
                })

            })
        });
    }


    getBarter = () => {
        var barter = db.collection('requested_items')
        .where('user','==',this.state.userId)
        .get()
        .then( (snapshot)=>{
            snapshot.forEach( (doc)=>{

                if(doc.data().object_status !== 'received'){

                    this.setState({
                        requestId: doc.data().request_id,
                        requestedObjectName: doc.data().object_name,
                        objectStatus: doc.data().object_status,
                        docId: doc.id
                    })

                }

            })
        });
    }


    generateId(){
        var id = Math.random().toString(36).substring(7);
        return id;
    }


    addRequest = (objectName, objectDescription) => {

        var id = this.generateId();
        var userId = this.state.userId;

        db.collection("requested_items").add({
            "user": this.state.userId,
            "object_name": objectName,
            "object_description": objectDescription,
            "request_id": id,
            "object_status": "requested",
            "date": firebase.firestore.FieldValue.serverTimestamp()
        });

        db.collection('users')
        .where('email_id','==',userId)
        .get()
        .then()
        .then( (snapshot)=>{
            snapshot.forEach( (doc)=>{

                db.collection('users').doc(doc.id).update({
                    'is_barter_active': true
                })

            })
        })

        this.setState({
            objectName: '',
            objectDescription: '',
            requestId: id
        });

    }


    componentDidMount(){
        this.getIsBarterActive();
        this.getBarter();
    }


    forReceivedObjects = ( objectName ) => {
        var userId = this.state.userId;
        var requestId = this.state.requestId;

        db.collection('completed_barters').add({
            'user_id': userId,
            'object_name': objectName,
            'request_id': requestId,
            'object_status': "received"
        });
    }


    updateObjectStatusAndUserBarter = () => {
        
        db.collection('users').doc(this.state.docId).update({
            object_status: "received"
        });

        db.collection('users')
        .where('email_id','==',this.state.userId)
        .get()
        .then( (snapshot)=>{
            snapshot.forEach( (doc)=>{

                db.collection('users').doc(doc.id).update({
                    is_barter_active: false
                })

            })
        });
    }
    

    sendNotification = () => {

        db.collection('users')
        .where('email_id','==',this.state.userId)
        .get()
        .then( (snapshot)=>{
            snapshot.forEach( (doc)=>{

                var firstName = doc.data().first_name
                var lastName = doc.data().last_name

                db.collection('all_notifications')
                .where('request_id','==',this.state.request_id)
                .get()
                .then( (snapshot)=>{
                    snapshot.forEach( (doc)=>{

                        var donorId = doc.data()
                    })
                })

            })
        })

    }


    render(){
        if(this.state.isBarterActive === true){
            return(
                <View>
                    <AppHeader title = "Exchange Articles" />

                    <View>
                        <Text style = {styles.activeRequestText}>You already have an active request</Text>

                        <View>
                            <Text>Object Name: </Text>
                            <Text>{this.state.requestedObjectName}</Text>
                        </View>

                        <View>
                            <Text>Object Status: </Text>
                            <Text>{this.state.objectStatus}</Text>
                        </View>

                        <View>
                            <TouchableOpacity
                              style = {styles.receivedButton}
                              onPress = {()=>{
                                 this.sendNotification();
                                 this.updateObjectStatusAndUserBarter();
                                 this.forReceivedObjects(this.state.objectName);
                              }}>
                               <Text>Received the Object</Text>
                           </TouchableOpacity>
                        </View>
                    </View>
                    
                </View>
            )
        }
        else{
            return(
                <View>
    
                    <AppHeader title = "Exchange Articles"/>
                    <Text>{this.state.isUserQueryWorking}</Text>
    
                    <View style = {styles.container}>
    
                        <TextInput 
                          style = {styles.formInput}
                          placeholder = "Enter the object to request"
                          placeholderTextColor = '#F6C4B2'
                          autoFocus = {true}
                          onChangeText = {(text)=>{
                            this.setState({
                              objectName:text
                             })
                          }}/>
    
                        <TextInput 
                          style = {styles.formInput}
                          placeholder = "Describe the aforementioned object"
                          placeholderTextColor = '#F6C4B2'
                          onChangeText = {(text)=>{
                            this.setState({
                              objectDescription: text
                            })
                          }}
                          multiline = {true}
                          numberOfLines = {11}/>
    
                        <TouchableOpacity
                          style = {styles.submitButton}
                          onPress = {()=>{
                            this.addRequest(this.state.objectName, this.state.objectDescription);
                            alert("Added Request");
                          }}>
                            <Text style = {styles.submitButtonText}>SUBMIT</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          onPress = {()=>{
                              this.setState({
                                  isBarterActive: true
                              })
                          }}>
                            <Text>View other</Text>
                        </TouchableOpacity>
    
                    </View>
                </View>
            )
        }
    }

}


const styles = StyleSheet.create({

    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 100
    },

    formInput: {
        width: '75%',
        backgroundColor: '#AE8277',
        borderBottomColor: '#494951',
        borderBottomWidth: 2,
        padding: 13,
        borderRadius: 4,
        fontSize: 15,
        fontFamily: 'big caslon',
        marginBottom: 30
    },

    submitButton: {
        backgroundColor: '#5C96B6',
        padding: 15,
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#31565F',
        shadowOffset: {width: 5, height: 5},
        shadowRadius: 4,
    },

    submitButtonText: {
        fontFamily: 'big caslon',
        textAlign: 'center',
        fontSize: 19
    }

})