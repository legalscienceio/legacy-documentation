// Quick example of accessing some meaningful dataset items...

// Just load the result as JSON...
data = require(("./local-eviction-laws.json"))

const selectedSeries = 0

// Write results out to the screen...
console.log(
    data.details.title, '\n',
    'Series:', data.mappable_data.length, // How many series in the dataset
    'Questions:', data.questions_answers.length, '\n', // How many questions in the dataset
    'First series jurisdiction:', data.mappable_data[selectedSeries].name, '\n',
    'Citations:', Object.keys(data.mappable_data[selectedSeries].citations).length, // How many citations contained in the first series
    'Cautions:', Object.keys(data.mappable_data[selectedSeries].cautions).length, // How many cautions contained in the first series
    'Answers:', Object.keys(data.mappable_data[selectedSeries].answers).length, // How many answers contained in the first series
)

// Get a citation...
const selectedCitation = 0
const selectedQuestionId = Object.keys(data.mappable_data[selectedSeries].citations)[selectedCitation]
const citation = data.mappable_data[selectedSeries].citations[selectedQuestionId][0]

console.log(    
    citation.path, '\n',
    citation.text, '\n'
)