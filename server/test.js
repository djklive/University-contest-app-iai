import fetch from "node-fetch";

async function testNotchPay() {
  const response = await fetch("https://api.notchpay.co/countries", {
    method: "GET",
    headers: {
      "Authorization": "pk.FxXKsGtnmeui9aoDq2CodjWZfqSdXX8MtY2fzfbQd3QU1IqBSDQgdM9LwPTXb4XDAOvaeDWhwqhizwEJBzbHmaq39cuXLQCeAd4tXnlSrbamWHXNhpLY05mKO0fWa",
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();
  console.log(data);
}

testNotchPay();