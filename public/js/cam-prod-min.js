var accountFetchPeriod=5e3,priceFetchPeriod=2e4,btcDecimals=5,ethDecimals=5,accounts=[],currentAccountUpdated=0,accountsRefresh=!1,ethPrice=0,btcPrice=0;function Account(e,t,c,o){this.code=e,this.currency=t,this.address=c,this.label=o}function showAccountPanel(){$("#add-address-btn").hide(),$("#new-account-panel").fadeIn(),$("#acc-address").focus()}function createAccountCard(e){0===accounts.length&&$("#account-container").empty();var t="",c="c2",o=accounts.length%8;if(1!==o&&3!==o&&4!==o&&6!==o||(c="c4"),t+='<div class="overview-item overview-item--'+c+'">',t+='<button type="button" class="remove-account-btn" aria-label="Close" onclick="removeAccount(\''+e.code+"');\">",t+='<span aria-hidden="true">&times;</span>',t+="</button>",t+='<div class="overview__inner">',t+='<div class="overview-box clearfix">',"BTC"===e.currency){t+='<img src="images/btc_outline.png" class="crypto-logo">',t+='<div class="text">',t+='<h2 class="balance tooltipster">-.-----</h2>',t+='<span class="balance-label">Bitcoins | </span>';var a="https://www.blockchain.com/btc/address/"+e.address}else{t+='<img src="images/eth_outline.png" class="crypto-logo">',t+='<div class="text">',t+='<h2 class="balance tooltipster">-.-----</h2>',t+='<span class="balance-label">Ethers | </span>';a="https://etherscan.io/address/"+e.address}t+='<b class="usd-balance">usd ---.--</b>',t+="</div>",t+="</div>";var n=e.address.substr(0,5),s=e.address.slice(-5);t+='<p class="added-address">',t+="<b>"+e.label+"</b> | ",t+='<span class="tooltipster" title="'+e.address+'">'+n+"..."+s+"</span>",t+='<a class="more-info-btn" target="_blank" href="'+a+'"> > </a>',t+="</p>",t+="</div>",t+="</div>";var r=document.createElement("div");r.id=e.code,r.className="col-sm-6 col-lg-3 account-card",r.innerHTML=t,$("#account-container").append(r),initTooltip($("#"+e.code).find(".added-address"))}function loadSavedAccountsFromCookie(){var e=Cookies.get("cam-info");if(e&&2<e.length){e=$.parseJSON(e),$("#account-container").empty();for(var t=0;t<e.length;t++)addAccount(e[t].currency,e[t].address,e[t].label);console.log("Accounts pre loaded: "+e.length)}else console.log("No accounts pre loaded")}function saveAccountsToCookie(){Cookies.set("cam-info",JSON.stringify(accounts),{expires:365})}function startAccountRefresh(){accountsRefresh=!0,refreshAccounts()}function refreshAccounts(){accountsRefresh&&setTimeout(updateAccounts,accountFetchPeriod)}function updateAccounts(){if(0===accounts.length)return console.log("No accounts added yet"),void refreshAccounts();currentAccountUpdated===accounts.length&&(currentAccountUpdated=0);try{var e=accounts[currentAccountUpdated];"BTC"===e.currency?requestBtcBalance(e):requestEthBalance(e)}catch(e){console.log("Some account was removed or some error found. Restarting."),currentAccountUpdated=0,refreshAccounts()}}function createAccount(){var e=$("#acc-currency").val(),t=$("#acc-address").val().trim();addAccount(e,t,$("#acc-label").val())?($("#acc-address").val(""),$("#acc-label").val(""),$("#new-account-panel").hide(),$("#add-address-btn").fadeIn()):(alert("Verify address format for the currency selected"),""===t&&($("#new-account-panel").hide(),$("#add-address-btn").fadeIn()))}function addAccount(e,t,c){if("BTC"!==e&&"ETH"!==e)return console.log("unsupported currency"),!1;var o=!1;"BTC"===e?o=new RegExp("^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$").test(t):o=new RegExp("^0x[a-fA-F0-9]{40}$").test(t);if(!o)return console.log("unsupported address for "+e),!1;var a=e+"-"+(accounts.length+1);c||(c=a);var n=new Account(a,e,t,c);return createAccountCard(n),accounts.push(n),console.log("new account added"),saveAccountsToCookie(),!0}function removeAccount(t){accounts=accounts.filter(function(e){return e.code!==t}),$("#"+t).fadeOut("normal",function(){$("#"+t).remove()}),saveAccountsToCookie()}function requestEthBalance(i){0===accounts.length&&(console.log("No accounts added yet"),refreshAccounts());var e="https://api.etherscan.io/api?module=account&action=balance&address="+i.address+"&tag=latest&apikeyHIVHFXVPC9CPKN1RFZ8PN8HAAMQHNBTCHA";$.ajax({type:"GET",url:e,data:{},contentType:"application/json; charset=utf-8",crossDomain:!0,dataType:"json",success:function(e,t,c){console.log("Eth data received: "+i.code);var o=ethFromWei(e.result),a=1e3<=o?o.toLocaleString():o,n=$("#"+i.code);n.find(".balance").text(a);var s=(new Date).toTimeString();if(n.find(".balance").hasClass("tooltipstered")?n.find(".balance").tooltipster("content",s):(n.find(".balance").prop("title",s),initTooltip(n.find(".balance").parent())),0!==ethPrice){var r=parseFloat((o*ethPrice).toFixed(2));99e6<r&&(r=Math.round(r)),n.find(".usd-balance").text("usd "+r.toLocaleString())}currentAccountUpdated+=1,refreshAccounts()},error:function(e,t){console.log("Eth fail: "+t.code),console.log(e),currentAccountUpdated+=1,refreshAccounts()}})}function requestBtcBalance(i){0===accounts.length&&(console.log("No accounts added yet"),refreshAccounts());var e="https://blockexplorer.com/api/addr/"+i.address+"/balance";$.ajax({type:"GET",url:e,data:{},contentType:"application/json; charset=utf-8",crossDomain:!0,dataType:"json",success:function(e,t,c){console.log("Btc data received: "+i.code);var o=btcFromSatoshi(e.toString()),a=1e3<=o?o.toLocaleString():o,n=$("#"+i.code);n.find(".balance").text(a);var s=(new Date).toTimeString();if(n.find(".balance").hasClass("tooltipstered")?n.find(".balance").tooltipster("content",s):(n.find(".balance").prop("title",s),initTooltip(n.find(".balance").parent())),0!==btcPrice){var r=parseFloat((o*btcPrice).toFixed(2));99e6<r&&(r=Math.round(r)),n.find(".usd-balance").text("usd "+r.toLocaleString())}currentAccountUpdated+=1,refreshAccounts()},error:function(e,t){console.log("BTC Update fail: "+t.code),console.log(e),currentAccountUpdated+=1,refreshAccounts()}})}function updateEthPrice(){$.ajax({type:"GET",url:"https://api.etherscan.io/api?module=stats&action=ethprice&apikeyHIVHFXVPC9CPKN1RFZ8PN8HAAMQHNBTCHA",data:{},contentType:"application/json; charset=utf-8",crossDomain:!0,dataType:"json",success:function(e,t,c){ethPrice=parseFloat(e.result.ethusd),ethBtcPrice=parseFloat(e.result.ethbtc);var o="BTC: usd "+(btcPrice=parseFloat((ethPrice/ethBtcPrice).toFixed(2))).toLocaleString()+" | ETH: usd "+ethPrice.toLocaleString();console.log("Price data received:"+o),$("#right-footer").find(".prices").text(o),$("#left-footer").find(".prices").text("Status: Connected"),setTimeout(updateEthPrice,priceFetchPeriod)},error:function(e,t){console.log("ETH Price fail"),console.log(e),$("#left-footer").find(".prices").text("Status: Disconnected"),setTimeout(updateEthPrice,priceFetchPeriod)}})}function ethFromWei(e){var t=parseInt(e)/1e18;return parseFloat(t.toFixed(ethDecimals))}function btcFromSatoshi(e){var t=parseInt(e)/1e8;return parseFloat(t.toFixed(btcDecimals))}function stopAccountRefresh(){accountsRefresh=!1}function initTooltip(e){e.find(".tooltipster").tooltipster({theme:"tooltipster-shadow",animation:"fade",delay:300,interactive:!0})}console.log("- All controller loaded -"),$(document).ready(function(){loadSavedAccountsFromCookie(),updateEthPrice(),startAccountRefresh()});