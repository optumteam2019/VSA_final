const express = require('express');
const bodyParser = require('body-parser');
const { WebhookClient } = require('dialogflow-fulfillment');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

const CONNECTION_URL = "mongodb+srv://optumteam:cafeteriaburger@cluster0-gi5ar.mongodb.net/test?retryWrites=true&w=majority";
const DATABASE_NAME= "Member_Details";

var database, collection;
var port = process.env.PORT || 8080;

const app = express();

var pr_name = ""; var pr_age = null; var pr_gender = ""; var pr_zipcode = null; var pr_medicare = "";
var pr_datea = ""; var pr_dateb = ""; var pr_plan = ""; var pr_enroll = "";

var plan_list1 = "Plan 1 : AARP MedicareComplete SecureHorizons Focus Plan 2 : AARP MedicareComplete SecureHorizons Premier";
var plan_list2 = "Plan 3 : AARP MedicareComplete SecureHorizons Assure Plan 4 : AARP MedicareComplete SecureHorizons Essential";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname));

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))

app.get('/update', function(req, res){
  var result={"Name":pr_name, "Age":pr_age, "Zipcode":pr_zipcode, "Gender":pr_gender,"medc_num":pr_medicare, "datea":pr_datea.slice(0,10), "dateb":pr_dateb.slice(0,10), "Plan":pr_plan, "Enroll":pr_enroll}; 
  pr_enroll = ""
  res.send(result);
});

app.post('/', function(req, res)
{
  collection.insert(req.body, (error, result) => 
  {
    if(error) {
        return res.status(500).send(error);
    }
    res.send("Successfully Submitted and saved in the database collection");
  });
    pr_name = ""; pr_age = null; pr_gender = ""; pr_zipcode = null; pr_medicare = ""; 
    pr_datea = ""; pr_dateb = ""; pr_plan = ""; pr_enroll = "";   
});

app.post('/dialogflow', express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res })

  function help_func(agent)
  {
    if (pr_name == "")
    {
      agent.add('Please provide your full name as written on your Medicare Health Insurance Card.');
    }

    else if(pr_age == null)
    {
      agent.add('M&R plans are for members who are 65 or older. Please provide your age to continue.' );
    }

    else if(pr_gender=="")
    {
      agent.add('Male/Female');
    }

    else if(pr_medicare=="")
    {
      agent.add('Medicare number is an alpha-numeric unique ID written on your Medicare Health Insurance Card. Please provide your medicare number in the format ####-XXXX');
    }

    else if(pr_datea=="" || pr_dateb=="")
    {
      agent.add('It is mandatory to have PART A and Part B plan before enrolling in a Medicare Advantage Plan. You can check for their effective dates on your Medicare Health Insurance Card.');
    }

    else if(pr_zipcode==null)
    {
      agent.add('Please provide your current zipcode to continue.')
    }

    else if(pr_plan=="")
    {
      if(pr_zipcode==90024)
      {
        agent.add('Select a plan from the following available list of plans : \n'+plan_list1);
      }
      else if(pr_zipcode==90025)
      {
        agent.add('Select a plan from the following available list of plans : \n'+plan_list2);
      }
      
    }

    else if(pr_enroll=="")
    {
      agent.add('Do you want to enroll in the chosen plan ?')
    }  
  }

  function welcome () {
    agent.add('Hi, I am Krista from UnitedHealth Care! I will assist you in enrolling for the medicare advantage plan. \nWhat\'s your good name ?')
 
  }

  function fall_func(agent)
  {
    agent.add('Sorry I missed that ! Can you please repeat ?');
  }

  function name_fun (agent)
  {
      var person_name = agent.parameters["given-name"] + ' ' + agent.parameters["last-name"];
      pr_name = person_name;
      //console.log(person_age)
      if(pr_age==null){
        agent.add('What\'s your age '+agent.parameters["given-name"]+'?');
      }
      else if(pr_gender=="")
      {
        agent.add('What\'s your gender?')
      }
      else if(pr_medicare=="")
      {
        agent.add('Please provide your Medicare Number in the Format : ####-XXXX)?');
      }
      else if(pr_datea=="")
      {
        agent.add('What\'s your PART A effective date as written on your Medical Health Insurance Card.');
      }
      else if(pr_dateb=="")
      {
        agent.add('What\'s your PART B effective date as written on your Medical Health Insurance Card.');
      }
      else if(pr_zipcode==null)
      {
        agent.add('What is the zipcode of your current place of residence ?')
      }
      else if(pr_plan)
      {
        if(pr_zipcode==90024)
        {
          agent.add('Select a plan from the following available list of plans : \n'+plan_list1);
        }
        else if(pr_zipcode==90025)
        {
          agent.add('Select a plan from the following available list of plans : \n'+plan_list2);
        }
      }
  }

  function age_fun (agent)
  {
      const person_age = (agent.parameters["age"]).amount;
      pr_age = person_age;
      //console.log('Age : '+ person_age)
      const person_gender = agent.parameters["custom-gender"];
      //console.log(person_age)
      if(person_age<65)
      {
        agent.add('You are not eligible for enrolling in this plan');
      }
      else
      {
        if(pr_name=="")
        {
          agent.add('What\'s your good name please ?');
        }
        else if(pr_gender=="")
        {
          agent.add('What\'s your gender?')
        }
        else if(pr_medicare=="")
        {
          agent.add('Please provide your Medicare Number in the Format : ####-XXXX)?');
        }
        else if(pr_datea=="")
        {
          agent.add('What\'s your PART A effective date as written on your Medical Health Insurance Card.');
        }
        else if(pr_dateb=="")
        {
          agent.add('What\'s your PART B effective date as written on your Medical Health Insurance Card.');
        }
        else if(pr_zipcode==null)
        {
          agent.add('What is the zipcode of your current place of residence ?')
        }
        else if(pr_plan)
        {
          if(pr_zipcode==90024)
          {
            agent.add('Select a plan from the following available list of plans : \n'+plan_list1);
          }
          else if(pr_zipcode==90025)
          {
            agent.add('Select a plan from the following available list of plans : \n'+plan_list2);
          }
        }
      }
  }

  function gender_func(agent)
  {
    var person_gender = agent.parameters["custom-gender"];
    pr_gender = person_gender;

    if (pr_name=="")
    {
      agent.add('What\'s your good name please ?');
    }
    else if(pr_age==null){
      agent.add('What\'s your age ?');
    }
    else if(pr_medicare=="")
    {
      agent.add('Please provide your Medicare Number in the Format : ####-XXXX)?');
    }
    else if(pr_datea=="")
    {
      agent.add('What\'s your PART A effective date as written on your Medical Health Insurance Card.');
    }
    else if(pr_dateb=="")
    {
      agent.add('What\'s your PART B effective date as written on your Medical Health Insurance Card.');
    }
    else if(pr_zipcode==null)
    {
      agent.add('What is the zipcode of your current place of residence ?')
    }
    else if(pr_plan)
    {
      if(pr_zipcode==90024)
      {
        agent.add('Select a plan from the following available list of plans : \n'+plan_list1);
      }
      else if(pr_zipcode==90025)
      {
        agent.add('Select a plan from the following available list of plans : \n'+plan_list2);
      }
    }
  }

  function medicare_func(agent)
  {
    var person_medicare = agent.parameters["custom-medicare"];
    pr_medicare = person_medicare;
    if (pr_name=="")
    {
      agent.add('What\'s your good name please ?');
    }
    else if(pr_age==null){
      agent.add('What\'s your age ?');
    }
    else if(pr_gender=="")
    {
      agent.add('What\'s your gender?')
    }
    else if(pr_datea=="")
    {
      agent.add('What\'s your PART A effective date as written on your Medical Health Insurance Card.');
    }
    else if(pr_dateb=="")
    {
      agent.add('What\'s your PART B effective date as written on your Medical Health Insurance Card.');
    }
    else if(pr_zipcode==null)
    {
      agent.add('What is the zipcode of your current place of residence ?')
    }
    else if(pr_plan)
    {
      if(pr_zipcode==90024)
      {
        agent.add('Select a plan from the following available list of plans : \n'+plan_list1);
      }
      else if(pr_zipcode==90025)
      {
        agent.add('Select a plan from the following available list of plans : \n'+plan_list2);
      }
    }
  }

  function date_func(agent)
  {
    if (pr_datea == "")
    {
      person_date = agent.parameters["date"];
      pr_datea = person_date;
      if (pr_name=="")
      {
        agent.add('What\'s your good name please ?');
      }
      else if(pr_age==null){
        agent.add('What\'s your age ?');
      }
      else if(pr_gender=="")
      {
        agent.add('What\'s your gender?')
      }
      else if(pr_medicare=="")
      {
        agent.add('Please provide your Medicare Number in the Format : ####-XXXX)?');
      }
      else if(pr_dateb=="")
      {
        agent.add('What\'s your PART B effective date as written on your Medical Health Insurance Card ?');
      }
      else if(pr_zipcode==null)
      {
        agent.add('What is the zipcode of your current place of residence ?')
      }
      else if(pr_plan)
      {
        if(pr_zipcode==90024)
        {
          agent.add('Select a plan from the following available list of plans : \n'+plan_list1);
        }
        else if(pr_zipcode==90025)
        {
          agent.add('Select a plan from the following available list of plans : \n'+plan_list2);
        }
      }
    }
    else
    {
      person_date = agent.parameters["date"];
      pr_dateb = person_date;
      if (pr_name=="")
      {
        agent.add('What\'s your good name please ?');
      }
      else if(pr_age==null){
        agent.add('What\'s your age ?');
      }
      else if(pr_gender=="")
      {
        agent.add('What\'s your gender?')
      }
      else if(pr_medicare=="")
      {
        agent.add('Please provide your Medicare Number in the Format : ####-XXXX)?');
      }
      else if(pr_zipcode==null)
      {
        agent.add('What is the zipcode of your current place of residence ?')
      }
      else if(pr_plan=="")
      {
        if(pr_zipcode==90024)
        {
          agent.add('Select a plan from the following available list of plans : \n'+plan_list1);
        }
        else if(pr_zipcode==90025)
        {
          agent.add('Select a plan from the following available list of plans : \n'+plan_list2);
        }
      }
    }
  }

  function zip_func(agent)
  {
      var person_zip = agent.parameters["zip-code"];
      pr_zipcode = person_zip;
      //console.log('Zip Code : '+person_zip);
      if (pr_name=="")
      {
        agent.add('What\'s your good name please ?');
      }
      else if(pr_age==null){
        agent.add('What\'s your age ?');
      }
      else if(pr_gender=="")
      {
        agent.add('What\'s your gender?')
      }
      else if(pr_medicare=="")
      {
        agent.add('Please provide your Medicare Number in the Format : ####-XXXX)?');
      }
      else if(pr_datea=="")
      {
        agent.add('What\'s your PART A effective date as written on your Medical Health Insurance Card.');
      }
      else if(pr_dateb=="")
      {
        agent.add('What\'s your PART B effective date as written on your Medical Health Insurance Card.');
      }
      else if(pr_plan=="")
      {
        if(pr_zipcode==90024)
        {
          agent.add('Select a plan from the following available list of plans : \n'+plan_list1);
        }
        else if(pr_zipcode==90025)
        {
          agent.add('Select a plan from the following available list of plans : \n'+plan_list2);
        }
      }
  }

  function plan_func(agent)
  {
    var person_plan = agent.parameters["custom-plan"];
    pr_plan = person_plan;
    if (pr_name=="")
    {
      agent.add('What\'s your good name please ?');
    }
    else if(pr_age==null){
      agent.add('What\'s your age ?');
    }
    else if(pr_gender=="")
    {
      agent.add('What\'s your gender?')
    }
    else if(pr_medicare=="")
    {
      agent.add('Please provide your Medicare Number in the Format : ####-XXXX)?');
    }
    else if(pr_datea=="")
    {
      agent.add('What\'s your PART A effective date as written on your Medical Health Insurance Card.');
    }
    else if(pr_dateb=="")
    {
      agent.add('What\'s your PART B effective date as written on your Medical Health Insurance Card.');
    }
    else
    {
      agent.add('Do you want to submit the application?');
    } 
  }

  function enroll_func(agent)
  {
    var person_enroll = agent.parameters["custom-enroll"];
    
    pr_enroll = person_enroll;
    if (person_enroll=="Enroll" || person_enroll=="Submit")
    {
       agent.add('Congrats !');
    }
    else
    {
      agent.add('Your feedback is valuable to us. Contact customer care for any help.');
    }
  }

  let intentMap = new Map()
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fall_func);
  intentMap.set('Name_Intent', name_fun);
  intentMap.set('Age_Intent', age_fun);
  intentMap.set('Zipcode_Intent', zip_func)
  intentMap.set('Gender_Intent', gender_func);
  intentMap.set('Enroll_Intent', enroll_func);
  intentMap.set('Medicare_Number_Intent', medicare_func);
  intentMap.set('Date_Intent', date_func);
  intentMap.set('Select_Plan_Intent', plan_func);
  intentMap.set('Help_Intent', help_func);
  agent.handleRequest(intentMap)
})

app.listen(port, () => 
{
  MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => 
  {
      if(error) {
          throw error;
      }
      database = client.db(DATABASE_NAME);
      collection = database.collection("New_Users");
  });
})