import { View, Alert, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { PlatformPay, StripeProvider, usePlatformPay, createPlatformPayPaymentMethod } from '@stripe/stripe-react-native';
import axios from 'axios';
import React from 'react';

const App = () => {
  const {
    isPlatformPaySupported,
    confirmPlatformPayPayment,
  } = usePlatformPay();
  React.useEffect(() => {
    (async function () {
      if (!(await isPlatformPaySupported({ googlePay: { testEnv: true } }))) {
        Alert.alert('Google Pay is not supported.');
        return;
      }
    })();
  }, []);
  const createPaymentMethod = async () => {
    const { error, paymentMethod } = await createPlatformPayPaymentMethod({
      applePay: {
        cartItems: [
          {
            label: 'Example item name',
            amount: '14.00',
            paymentType: PlatformPay.PaymentType.Immediate,
          },
          {
            label: 'Total',
            amount: '12.75',
            paymentType: PlatformPay.PaymentType.Immediate,
          },
        ],
        merchantCountryCode: 'US',
        currencyCode: 'USD',
      },
    });

    if (error) {
      Alert.alert(error.code, error.message);
      return;
    } else if (paymentMethod) {
      Alert.alert(
        'Success',
        `The payment method was created successfully. paymentMethodId: ${paymentMethod.id}`
      );
    }
  };
  const fetchPaymentIntentClientSecret = async () => {
    const apiUrl = 'https://amplepoints.com/apiendpoint/createpaymentintend?user_id=126&total_amount=118.00&order_id=AMPLI9Zd27&customer_name=Hiren Buhecha';

    const response = await axios.get(apiUrl);
    console.log("Response", response.data.data)
    if (response && response.data && response.data.data.clientSecret) {

      return response.data.data.clientSecret;
    };
  }

  const payApple = async () => {

    const clientSecret = await fetchPaymentIntentClientSecret()
    const { error } = await confirmPlatformPayPayment(
      clientSecret,
      {
        applePay: {
          cartItems: [
            {
              label: 'Example item name',
              amount: '14.00',
              paymentType: PlatformPay.PaymentType.Immediate,
            },
            {
              label: 'Total',
              amount: '12.75',
              paymentType: PlatformPay.PaymentType.Immediate,
            },
          ],
          merchantCountryCode: 'US',
          currencyCode: 'USD',
          requiredShippingAddressFields: [
            PlatformPay.ContactField.PostalAddress,
          ],
          requiredBillingContactFields: [PlatformPay.ContactField.PhoneNumber],
        },
      }
    );
    if (error) {
      // handle error
    } else {
      Alert.alert('Success', 'Check the logs for payment intent details.');
    }

  }

  const pay = async () => {

    const clientSecret = await fetchPaymentIntentClientSecret();
    console.log("Client", clientSecret)
    const { error } = await confirmPlatformPayPayment(
      clientSecret,
      {
        googlePay: {
          testEnv: true,
          merchantName: 'JHassnian Ali',
          merchantCountryCode: 'US',
          currencyCode: 'USD',
          billingAddressConfig: {
            format: PlatformPay.BillingAddressFormat.Full,
            isPhoneNumberRequired: true,
            isRequired: true,
          },
        },
      }
    );

    if (error) {
      Alert.alert(error.code, error.message);
      return;
    }
  };


  const onMessage = (event) => {
    const message = event.nativeEvent.data;
    if (message === 'Button Pressed') {
      pay();
    }
  };
  const injectedJavaScript = `
  (function() {
    var radio = document.getElementById('grade02');
    var buttons = document.querySelectorAll('.btn.type01');
    radio.addEventListener('change', function() {
      if (this.checked) {
        buttons.forEach(function(button) {
             button.addEventListener('click', function() {
                 window.ReactNativeWebView.postMessage('Button Pressed');
               });
             });
      }
    });
  })();
`;
  return (
    <StripeProvider publishableKey='pk_test_51 NpOZ4GY4n5u6WbIlWOsccAKTTMLq7xnjfG8fFboidp6jZCx2XlssuBHyNbvBsqfGDkbVkZH2Knka498eIzAjdPZ00YZBjdzik'>

      <View style={styles.container}>
        <WebView
          source={{ uri: 'https://matchfy.net/' }}
          onMessage={onMessage}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          injectedJavaScript={injectedJavaScript}
        />
      </View>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
