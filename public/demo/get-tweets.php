<?php
    session_start();
    require_once("twitteroauth-master/twitteroauth/twitteroauth.php"); //Path to twitteroauth library

    $twitteruser = "YOUR-TWITTER-USERNAME-HERE";
    $notweets = 5;
    $consumerkey = "YOUR-TWITTER-CONSUMERKEY-HERE";
    $consumersecret = "YOUR-TWITTER-CONSUMERSECRET-HERE";
    $accesstoken = "YOUR-TWITTER-ACCESSTOKEN-HERE";
    $accesstokensecret = "YOUR-TWITTER-ACCESSSECRET-HERE";

    function getConnectionWithAccessToken($cons_key, $cons_secret, $oauth_token, $oauth_token_secret) {
      $connection = new TwitterOAuth($cons_key, $cons_secret, $oauth_token, $oauth_token_secret);
      return $connection;
    }

    $connection = getConnectionWithAccessToken($consumerkey, $consumersecret, $accesstoken, $accesstokensecret);

    $tweets = $connection->get("https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=".$twitteruser."&count=".$notweets);

    echo json_encode($tweets);
?>
