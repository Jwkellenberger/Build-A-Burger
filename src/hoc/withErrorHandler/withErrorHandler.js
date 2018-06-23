import React, {Component} from 'react';

import Modal from '../../components/UI/Modal/Modal'

const withErrorHandler =(WrappedComponent, axios)=>{
    return class extends Component{
        state = {
            error: null
        }
        
        componentWillMount(){
            axios.interceptors.request.use(req =>{
                this.setState({error: null});
                return req;
            })
            axios.interceptors.response.use(res => res, error =>{
                this.setState({error:error});
            });
        }

        errorConfirmedHandler=()=>{
            this.setState({error:null});
        }

        render(){
            let errorMessage = null;
            if(this.state.error){
                errorMessage = this.state.error.message;
            }
            return(
                <React.Fragment>
                    <Modal 
                        style={{textAlign: 'center'}} 
                        show={this.state.error}
                        modalClosed={this.errorConfirmedHandler}>
                        <p><strong>Monkeys are attempting to fix this issue:</strong></p>
                        <p> * <strong>{errorMessage}</strong></p>
                    </Modal>
                    <WrappedComponent{...this.props}/>
                </React.Fragment>
            );
        }
    }
}

export default withErrorHandler;