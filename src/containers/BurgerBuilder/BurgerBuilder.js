import React, { Component } from 'react';

import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';

import axios from '../../axios-orders';


const INGREDIENT_PRICES = {
    lettuce: 0.2,
    cheese: 0.3,
    meat: 1.0,
    bacon: 0.3
};

class BurgerBuilder extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {...}
    // }
    state = {
        ingredients: null,
        totalPrice: 0.5,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    }

    componentDidMount(){
        axios.get('https://react-build-a-burger-60ef4.firebaseio.com/ingredients.json')
            .then(response =>{
                const data = response.data;
                const ingredients = {
                    lettuce: data.lettuce,
                    bacon: data.bacon,
                    cheese: data.cheese,
                    meat: data.meat,
                };
                const oldPrice = this.state.totalPrice;
                let priceAddition = INGREDIENT_PRICES.lettuce * ingredients.lettuce;
                let newPrice;
                priceAddition = INGREDIENT_PRICES.meat * ingredients.meat;
                newPrice = oldPrice + priceAddition;
                priceAddition = INGREDIENT_PRICES.bacon * ingredients.bacon;
                newPrice +=priceAddition;
                priceAddition = INGREDIENT_PRICES.cheese * ingredients.cheese;
                newPrice +=priceAddition;
                this.setState({ingredients: ingredients, totalPrice: newPrice});
            })
            .catch(error =>{
                this.setState({error:true});
            });
    }

    updatePurchaseState (ingredients) {
        const sum = Object.keys( ingredients )
            .map( igKey => {
                return ingredients[igKey];
            } )
            .reduce( ( sum, el ) => {
                return sum + el;
            }, 0 );
        this.setState( { purchasable: sum > 0 } );
    }

    addIngredientHandler = ( type ) => {
        const oldCount = this.state.ingredients[type];
        const updatedCount = oldCount + 1;
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCount;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;
        this.setState( { totalPrice: newPrice, ingredients: updatedIngredients } );
        this.updatePurchaseState(updatedIngredients);
    }

    removeIngredientHandler = ( type ) => {
        const oldCount = this.state.ingredients[type];
        if ( oldCount <= 0 ) {
            return;
        }
        const updatedCount = oldCount - 1;
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCount;
        const priceDeduction = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceDeduction;
        this.setState( { totalPrice: newPrice, ingredients: updatedIngredients } );
        this.updatePurchaseState(updatedIngredients);
    }

    purchaseHandler = () => {
        this.setState({purchasing: true});
    }

    purchaseCancelHandler = () => {
        this.setState({purchasing: false});
    }

    purchaseContinueHandler = () => {
        this.setState({loading: true});
        const order = {
            ingredients: this.state.ingredients,
            price: this.state.totalPrice,
            // should calc server side
            customer: {
                name: 'Max AwesomeSause',
                email: 'max@Awesome.sause',
                streetAddress: '123 Test St.',
                city: 'Jacksonville',
                state: 'FL',
                zipCode: '32222',
                country: 'USA'
            },
            orderTime: '5:55pm',
            orderType: 'delivery',
            destination: '123 Test St. Jacksonville FL, 32222'
        }

        axios.post('/orders.json', order)
        // must add .json for firebase database
            .then(response => {
                this.setState({loading: false, purchasing: false});
                console.log(response)
            })
            .catch(error => {
                this.setState({loading: false, purchasing: false});
                console.log(error)
            });
    }

    render () {
        const disabledInfo = {
            ...this.state.ingredients
        };
        for ( let key in disabledInfo ) {
            disabledInfo[key] = disabledInfo[key] <= 0
        }

        let orderSummary = null;

        if(this.state.loading){
            orderSummary = <Spinner/>
        }

        let burger = this.state.error? <p>The Application Isn't Connecting to DataBase!</p> :<React.Fragment><br/><br/><br/><Spinner/></React.Fragment>;

        if(this.state.ingredients){
            burger = (
                <React.Fragment>
                    <Burger ingredients={this.state.ingredients} />
                    <BuildControls
                        ingredientAdded={this.addIngredientHandler}
                        ingredientRemoved={this.removeIngredientHandler}
                        disabled={disabledInfo}
                        purchasable={this.state.purchasable}
                        ordered={this.purchaseHandler}
                        price={this.state.totalPrice} />
                </React.Fragment>);

            orderSummary = <OrderSummary 
                ingredients={this.state.ingredients}
                price={this.state.totalPrice}
                purchaseCancelled={this.purchaseCancelHandler}
                purchaseContinued={this.purchaseContinueHandler} />
        }


        // {salad: true, meat: false, ...}
        return (
            <React.Fragment>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </React.Fragment>
        );
    }
}

export default withErrorHandler(BurgerBuilder, axios);