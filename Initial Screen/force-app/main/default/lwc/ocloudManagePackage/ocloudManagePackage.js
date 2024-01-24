// secondScreen.js
import { LightningElement, wire, track } from 'lwc';
import getStandardObjects from '@salesforce/apex/ObjectMetadataController.getStandardObjects';
import fetchFields from '@salesforce/apex/ObjectMetadataController.fetchFields';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ProcessAccessToken from '@salesforce/apex/SalesforceAccessToken.ProcessAccessToken';
import checkMWTokenRecord from '@salesforce/apex/SalesforceAccessToken.checkMWTokenRecord';

///// ----------------------------SCREEN 1 SETUP
export default class SecondScreen extends LightningElement {

    @wire(checkMWTokenRecord)
    wiredCheckMWTokenRecord({ data, error }) {
        if (data) {
            if (data) {
                this.screen2 = true;
                this.screen1 = false;
            } else {
                this.screen2 = false;
                this.screen1 = true;
            }
        } else if (error) {
            console.error(error);
        }
    }


    @track integrationId = '';
    @track clientKey = '';
    @track clientSecret = '';
    //contain fetched middleware mappings
    MiddleWareObjectMappings = [
        {
          "integrationObjectNameSF": "Contact",
          "integrationObjectNameMW": "User",
          "fieldMapping": [
            {
              "integrationFieldName": "fname",
              "sfFieldName": "FirstName",
              "integrationFieldType": "string",
              "sfFieldType": "STRING"
            },
            {
              "integrationFieldName": "Email",
              "sfFieldName": "Email",
              "integrationFieldType": "email",
              "sfFieldType": "EMAIL"
            }
          ]
        }
    ]; 

    handleInputChange(event) {
        // Capture the input values on change
        const fieldName = event.target.name;
        const value = event.target.value;

        if (fieldName === 'Integration-ID') {
            this.integrationId = value;
        } else if (fieldName === 'Client-Key') {
            this.clientKey = value;
        } else if (fieldName === 'Client-Secret') {
            this.clientSecret = value;
        }
    }

    handleButtonClick(event) {
        console.log('Button Clicked');
        if (this.integrationId === '' || this.clientKey === '' || this.clientSecret === '') {
            this.showToast('Error', 'Please fill in all required fields.', 'error');
        } else {
            this.screen1=false;
            this.screen2=true;
            // Use the imported method
            console.log('Step 1');
            ProcessAccessToken({ clientId: this.clientKey, clientSecret: this.clientSecret, IntegrationID: this.integrationId });
            this.showToast('Success', 'Successful Configuration with App', 'success');
        }
    }

    showToast(title, message, variant) {
        // Display a toast message
        const toastEvent = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(toastEvent);
    }




///// -------------------------------------



    objectOptions = [];
    middlewareObjectOptions = [
        {
            label: 'User',
            value: 'User',
            fields: [
                { apiName: 'Id', label: 'ID', dataType: 'string', required: true },
                { apiName: 'fname', label: 'FName', dataType: 'string', required: true },
                { apiName: 'lname', label: 'LName', dataType: 'string', required: true },
                { apiName: 'Email', label: 'Email', dataType: 'email', required: false },
                { apiName: 'age', label: 'Age', dataType: 'number', required: false },
                { apiName: 'gender', label: 'Gender', dataType: 'string', required: false },
                { apiName: 'address', label: 'Address', dataType: 'string', required: false }
            ]
        },
        {
            label: 'Post', 
            value: 'Post', 
            fields: [
                { apiName: 'Id', label: 'ID', dataType: 'string', required: true },
                { apiName: 'Title', label: 'Title', dataType: 'string', required: true },
                { apiName: 'Body', label: 'Body', dataType: 'textarea', required: false }
            ]
        },
        { 
            label: 'Person', 
            value: 'Person', 
            fields: [
                { apiName: 'FName', label: 'FName', dataType: 'string', required: true },
                { apiName: 'Age', label: 'Age', dataType: 'number', required: true },
                { apiName: 'B', label: 'Body', dataType: 'textarea', required: false },
                { apiName: 'Lname', label: 'Lname'}
            ]
        }
        // Add more middleware objects as needed
    ];
    selectedValueSF = ''
    selectedValueMW = ''
    SFFieldCounter = 0;
    MWFieldCounter = 0;
    screen1 = true;
    screen2 = false;
    screen3 = false;
    selectedSalesforceObject = '';
    selectedMiddlewareObject = '';
    salesforceObjectFields = [];
    middlewareObjectFields = [];
    selectedMiddlewareObjectFields = []; //keep track of selected fields of middleware object
    selectedSalesforceObjectFields = []; //keep track of selected fields of salesforce object
    mapping = {}; //It will contains the final JSON object that need to send to middle-ware
    fieldMapping = []; //It will contain final field mapping

    //Dynamic Dropdown Variables
    dropdownOptionsSF = []; //This will populate dynamically everytime request for new field mapping will receive
    dropdownOptionsMW = []; //This will populate dynamically everytime request for new field mapping will receive
    dropdownList = [];
    counter = 1;
    maxDropdowns = 0;

    async handlerFetchedMappingField(event){
        let currentIndex = event.target.dataset.index;

        console.log('Inside handlerFetchedMappingField');

        this.selectedSalesforceObject = this.MiddleWareObjectMappings[currentIndex].integrationObjectNameSF;

        //this.selectedSalesforceObject = 'Contact';
        //console.log('SF: ', this.selectedSalesforceObject);

        let result = await fetchFields({ objectApiName: this.selectedSalesforceObject });
        
        this.salesforceObjectFields = result.map(field => ({
            label: field.label,
            value: field.apiName,
            Dtype: field.dataType,
            required: field.required
        }));

        console.log('Length SF fields: ', this.salesforceObjectFields.length);

        this.selectedMiddlewareObject = this.MiddleWareObjectMappings[currentIndex].integrationObjectNameMW;
        //console.log('MW: ', this.selectedMiddlewareObject);
    
        this.handleMiddlewareObjectChange1(this.selectedMiddlewareObject);

        console.log('Length MW fields: ', this.middlewareObjectFields.length);

        this.dropdownOptionsSF = this.salesforceObjectFields;
        this.dropdownOptionsMW = this.middlewareObjectFields;

        const SfId = this.dropdownOptionsSF.find(obj => obj.value === 'Id');
            const MwId = this.dropdownOptionsMW.find(obj => obj.value === 'Id');

            this.fieldMapping.push({
                integrationFieldName: MwId.value,
                sfFieldName: SfId.value,
                integrationFieldType: MwId.Dtype,
                sfFieldType: SfId.Dtype
            });

        this.dropdownOptionsSF = this.dropdownOptionsSF.filter(obj => obj.value != 'Id');
        this.dropdownOptionsMW = this.dropdownOptionsMW.filter(obj => obj.value != 'Id');

        this.maxDropdowns = Math.min(this.salesforceObjectFields.length, this.middlewareObjectFields.length);
        
        this.dropdownList = [...this.dropdownList, { key: { SF: '', MW: '', countSF: this.counter, countMW: this.counter, optionsSF:this.dropdownOptionsSF, optionsMW:this.dropdownOptionsMW} }];
        
        //this.counter++;

        // this.selectedValueSF = this.MiddleWareObjectMappings[currentIndex].fieldMapping.sfFieldName;
        // this.selectedSalesforceObjectFields.push(this.getObjectByValueSF(event.detail.value));
        

        for(let i=0; i<this.MiddleWareObjectMappings[currentIndex].fieldMapping.length; i++){
            this.dropdownList[i].key.SF = this.MiddleWareObjectMappings[currentIndex].fieldMapping[i].sfFieldName;
            this.selectedSalesforceObjectFields.push(this.getObjectByValueSF(this.dropdownList[i].key.SF));
            this.SFFieldCounter++;
            this.dropdownOptionsSF = this.salesforceObjectFields.filter(ele => {
                return !this.selectedSalesforceObjectFields.some(obj => obj.value === ele.value);
            });

            this.dropdownList[i].key.MW = this.MiddleWareObjectMappings[currentIndex].fieldMapping[i].integrationFieldName;
            this.selectedMiddlewareObjectFields.push(this.getObjectByValueMW(this.dropdownList[i].key.MW));
            this.MWFieldCounter++;
            this.dropdownOptionsMW = this.middlewareObjectFields.filter(ele => {
                return !this.selectedMiddlewareObjectFields.some(obj => obj.value === ele.value);
            });

            this.counter++;

            this.dropdownList = [...this.dropdownList, { key: { SF: '', MW: '', countSF: this.counter, countMW: this.counter, optionsSF:this.dropdownOptionsSF, optionsMW:this.dropdownOptionsMW} }];
        }


        //re-refer array
        this.dropdownList.pop();
        this.dropdownList = [...this.dropdownList];
        this.counter--;

        //change screen2 to screen3
        this.screen2 = false;
        this.screen3 = true;

    }

    //helper function salesforce fields
    getObjectByValueSF(searchValue) {
        for (const obj of this.salesforceObjectFields) {
            if (obj.value === searchValue) {
                return obj;
            }
        }
        return null;
    }

    //helper function Middleware fields
    getObjectByValueMW(searchValue) {
        for (const obj of this.middlewareObjectFields) {
            if (obj.value === searchValue) {
                return obj;
            }
        }
        return null;
    }

    //helper function
    CallbackFunctionToFindFieldByIdSF(selectedValueSF) {

        return field => field.value === selectedValueSF;
    }
    //helper function
    CallbackFunctionToFindFieldByIdMW(selectedValueMW) {

        return field => field.value === selectedValueMW;
    }

    handleAdditionalMiddlewareFieldChange(event) {
        try {

            this.selectedMiddlewareObjectFields.push(this.getObjectByValueMW(event.detail.value));
            this.MWFieldCounter++;
            
            //here we will handle the logic for the change of selection later
            if(this.MWFieldCounter> this.counter){
                this.MWFieldCounter--; // reset the SF field counter
                const labelToRemove = this.dropdownList[event.target.dataset.index].key.MW;
                //fetch object that just got change
                this.selectedValueMW = event.detail.value;
                const ObjectToChange = this.dropdownList[event.target.dataset.index];
                ObjectToChange.key.MW = this.selectedValueMW;


                //remove the previous selected value from mapping
                this.selectedMiddlewareObjectFields = this.selectedMiddlewareObjectFields.filter(obj => obj.value !== labelToRemove);
                var fieldToInsert = this.middlewareObjectFields.find(this.CallbackFunctionToFindFieldByIdMW(labelToRemove));
                let targetIndex = event.target.dataset.index;

                this.dropdownList.forEach(obj => {
                    obj.key.optionsMW.unshift(fieldToInsert);
                });

                this.dropdownOptionsMW = this.middlewareObjectFields.filter(ele => {
                    return !this.selectedMiddlewareObjectFields.some(obj => obj.value === ele.value);
                });


                this.dropdownList = this.dropdownList.map(obj => ({
                    ...obj,
                    key: {
                      ...obj.key,
                      optionsMW: obj.key.optionsMW.filter(option => option.value !== this.selectedValueMW)
                    }
                  }));

                this.dropdownList[targetIndex]=ObjectToChange;
                this.dropdownList=[...this.dropdownList];
            }

            else{
    
                this.selectedValueMW = event.detail.value;
                var selectedField = this.middlewareObjectFields.find(this.CallbackFunctionToFindFieldByIdMW(this.selectedValueMW));
                this.dropdownOptionsMW = this.middlewareObjectFields.filter(ele => {
                    return !this.selectedMiddlewareObjectFields.some(obj => obj.value === ele.value);
                });
        
                const lastDropdownItem = this.dropdownList.pop();
                this.dropdownList = this.dropdownList.map(obj => {
                    obj.key.optionsMW = obj.key.optionsMW.filter(option => option.value !== this.selectedValueMW);
                    return obj;
                });
                lastDropdownItem.key.MW = selectedField.value;
                this.dropdownList = [...this.dropdownList, lastDropdownItem];
            }
            
            
        } catch (error) {
            console.log(error.message);
        }
    }
    

    handleAdditionalSalesforceFieldChange(event) {
        try {
    
            this.selectedSalesforceObjectFields.push(this.getObjectByValueSF(event.detail.value));
            this.SFFieldCounter++;
            //here we will handle the logic of value change later
            if(this.SFFieldCounter> this.counter){
                this.SFFieldCounter--; // reset the SF field counter
                const labelToRemove = this.dropdownList[event.target.dataset.index].key.SF;
                //fetch object that just got change
                this.selectedValueSF = event.detail.value;
                const ObjectToChange = this.dropdownList[event.target.dataset.index];
                ObjectToChange.key.SF = this.selectedValueSF;

                //remove the previous selected value from mapping
                this.selectedSalesforceObjectFields = this.selectedSalesforceObjectFields.filter(obj => obj.value !== labelToRemove);
                var fieldToInsert = this.salesforceObjectFields.find(this.CallbackFunctionToFindFieldByIdSF(labelToRemove));
                let targetIndex = event.target.dataset.index;

                this.dropdownList.forEach(obj => {
                    obj.key.optionsSF.unshift(fieldToInsert);
                });
                //updating the dropdown option
                this.dropdownOptionsSF = this.salesforceObjectFields.filter(ele => {
                    return !this.selectedSalesforceObjectFields.some(obj => obj.value === ele.value);
                });
                this.dropdownList = this.dropdownList.map(obj => ({
                    ...obj,
                    key: {
                      ...obj.key,
                      optionsSF: obj.key.optionsSF.filter(option => option.value !== this.selectedValueSF)
                    }
                  }));

                this.dropdownList[targetIndex]=ObjectToChange;

                this.dropdownList=[...this.dropdownList];

                console.log('Finish');

            }else{

                this.selectedValueSF = event.detail.value;
                
                //This selectedField contain the complete field and will be excluded from all the options in dropdownList
                var selectedField = this.salesforceObjectFields.find(this.CallbackFunctionToFindFieldByIdSF(this.selectedValueSF));
                this.dropdownOptionsSF = this.salesforceObjectFields.filter(ele => {
                    return !this.selectedSalesforceObjectFields.some(obj => obj.value === ele.value);
                });
        
                
                // const lastDropdownItem = this.dropdownList.pop();
                // lastDropdownItem.key.SF = selectedField.label;
                // this.dropdownList = [...this.dropdownList, lastDropdownItem];

                //here I need to exclude this selected field from all the existing options

                const lastDropdownItem = this.dropdownList.pop();

                this.dropdownList = this.dropdownList.map(obj => {
                    obj.key.optionsSF = obj.key.optionsSF.filter(option => option.value !== this.selectedValueSF);
                    return obj;
                });
                
                lastDropdownItem.key.SF = selectedField.value;
                this.dropdownList = [...this.dropdownList, lastDropdownItem];
            }
            
        } catch (error) {
            console.log(error.message);
        }
    }
    

    handleFieldSelectionSalesforce(event) {
        try{
            console.log(event.detail);
            this.selectedSalesforceObjectFields.push(this.getObjectByValueSF(event.detail.value));
            this.SFFieldCounter++;
            // if(this.counter!=this.selectedSalesforceObjectFields.length){
            //     this.SFFieldCounter--;
            //     this.selectedSalesforceObjectFields.splice(-2, 1); //remove the second last element if selection is made twice or more on same field mapping
            // }
            this.dropdownOptionsSF = this.salesforceObjectFields.filter(ele => {
                return !this.selectedSalesforceObjectFields.some(obj => obj.value === ele.value);
            });
        }
       
        catch(error){
            console.log(error.message);
        }
    }

    handleFieldSelectionMiddleware(event){
        this.selectedMiddlewareObjectFields.push(this.getObjectByValueMW(event.detail.value));
        this.MWFieldCounter++;
        // if(this.counter!=this.selectedMiddlewareObjectFields.length){
        //     this.MWFieldCounter--;
        //     this.selectedMiddlewareObjectFields.splice(-2, 1); //remove the second last element if selection is made twice or more on same field mapping
        // }

        this.dropdownOptionsMW = this.middlewareObjectFields.filter(ele => {
            return !this.selectedMiddlewareObjectFields.some(obj => obj.value === ele.value);
        });
    }

    //this function will be called on the screen2
    handleSalesforceObjectChange(event) {
        this.selectedSalesforceObject = event.detail.value; // label of the selected object
        fetchFields({ objectApiName: event.detail.value })
            .then(result => {
                this.salesforceObjectFields = result.map(field => ({
                    label: field.label,
                    value: field.apiName,
                    Dtype: field.dataType,
                    required: field.required
                }));
            })
            .catch(error => {
                console.error(error);
            });

    }

    handleSalesforceObjectChange1(ObjApiName) {

        console.log('Received: ', ObjApiName);
      
       this.selectedSalesforceObject = ObjApiName; // label of the selected object
        fetchFields({ objectApiName: ObjApiName })
            .then(result => {
                this.salesforceObjectFields = result.map(field => ({
                    label: field.label,
                    value: field.apiName,
                    Dtype: field.dataType,
                    required: field.required
                }));

                this.salesforceObjectFields = [...this.salesforceObjectFields];
            })
            .catch(error => {
                console.error(error);
            });

    }

    handleMiddlewareObjectChange1(ObjApiName) {
        try {
            this.selectedMiddlewareObject = ObjApiName; // label of the selected object
            if (this.selectedMiddlewareObject) {
                this.middlewareObjectFields = this.middlewareObjectOptions
                    .find(obj => obj.value === this.selectedMiddlewareObject)
                    ?.fields.map(field => ({ label: field.label, value: field.apiName, Dtype: field.dataType, required: field.required }));

            } else {
                this.middlewareObjectFields = [];
            }
        } catch (error) {
            console.error('Error in handleMiddlewareObjectChange:', error.message);
        }
    }

    //this function will be called on the screen2
    handleMiddlewareObjectChange(event) {
        try {
            this.selectedMiddlewareObject = event.detail.value; // label of the selected object
            if (this.selectedMiddlewareObject) {
                this.middlewareObjectFields = this.middlewareObjectOptions
                    .find(obj => obj.value === this.selectedMiddlewareObject)
                    ?.fields.map(field => ({ label: field.label, value: field.apiName, Dtype: field.dataType, required: field.required }));

            } else {
                this.middlewareObjectFields = [];
            }
        } catch (error) {
            console.error('Error in handleMiddlewareObjectChange:', error.message);
        }
    }    
    
    handleAddFieldMappingClick(){
        console.log('Inside handleAddFieldMappingClick');
        console.log('Max DD: ', this.maxDropdowns);
        console.log('Counter: ', this.counter);
        console.log('DD length: ', this.dropdownList.length);
        if(this.dropdownList[this.counter-1].key.SF === ''){
            console.log('Step 1');
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Select Salesforce Field',
                    variant: 'error'
                })
            );
        }else if(this.dropdownList[this.counter-1].key.MW === ''){
            console.log('Step 2');
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Select Third Party Field',
                    variant: 'error'
                })
            );
        }else{
            console.log('Step 3');
            if (this.counter <= this.maxDropdowns) {
                console.log('Step 4');
                this.counter++;
                this.selectedValueSF = '';
                this.selectedValueMW = '';
                this.dropdownList = [...this.dropdownList, { key: { SF: '', MW: '', countSF: this.counter, countMW: this.counter, optionsSF:this.dropdownOptionsSF, optionsMW:this.dropdownOptionsMW} }];
                
            } else {
                console.log('Step 5');
                console.error('Maximum number of dropdowns reached');
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Maximum number of Mapping reached!',
                        variant: 'error'
                    })
                );
            }
        } 
    }

    handleMapObjectButtonClick() {
        try {
            if (
                this.selectedSalesforceObjectFields.length === this.selectedMiddlewareObjectFields.length &&
                this.selectedSalesforceObjectFields.length > 0
            ) {
                let fieldMapping = [];
                for (let i = 0; i < this.selectedSalesforceObjectFields.length; i++) {
                    fieldMapping.push({
                        integrationFieldName: this.selectedMiddlewareObjectFields[i].value,
                        sfFieldName: this.selectedSalesforceObjectFields[i].value,
                        integrationFieldType: this.selectedMiddlewareObjectFields[i].Dtype,
                        sfFieldType: this.selectedSalesforceObjectFields[i].Dtype
                    });
                }
    
                let mapping = {
                    integrationObjectNameSF: this.selectedSalesforceObject,
                    integrationObjectNameMW: this.selectedMiddlewareObject,
                    fieldMapping: fieldMapping
                };
    
                this.mapping = mapping;
                this.fieldMapping = fieldMapping;

                console.log('Final Mapping: ', JSON.stringify(this.mapping));

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Object Mapping is Successfully Done!',
                        variant: 'success'
                    })
                );
            } else {
                console.error('Selected fields are not yet populated or have different lengths.');
            }
        } catch (error) {
            console.error('Error in handleMapObjectButtonClick:', error.message);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'ERROR!!',
                    variant: 'error'
                })
            );
        }
    }    
    
    

    handleMapButtonClick() {
        if (this.selectedSalesforceObject && this.selectedMiddlewareObject) {
            // Handle logic for moving to Screen 3 and any other necessary actions
            this.screen2 = false;
            this.screen3 = true;
            // Handle logic for max number of add fields
            this.maxDropdowns = Math.min(this.salesforceObjectFields.length, this.middlewareObjectFields.length);

            this.dropdownOptionsSF = this.salesforceObjectFields;
            this.dropdownOptionsMW = this.middlewareObjectFields;

            const SfId = this.dropdownOptionsSF.find(obj => obj.value === 'Id');
            const MwId = this.dropdownOptionsMW.find(obj => obj.value === 'Id');

            this.fieldMapping.push({
                integrationFieldName: MwId.value,
                sfFieldName: SfId.value,
                integrationFieldType: MwId.Dtype,
                sfFieldType: SfId.Dtype
            });

            //remove ID
            this.dropdownOptionsSF = this.dropdownOptionsSF.filter(obj => obj.value != 'Id');
            this.dropdownOptionsMW = this.dropdownOptionsMW.filter(obj => obj.value != 'Id');

            this.dropdownList = [...this.dropdownList, {
                key: {
                    SF: this.selectedValueSF,
                    MW: this.selectedValueMW, 
                    countSF: this.counter, 
                    countMW: this.counter, 
                    optionsSF:this.dropdownOptionsSF, 
                    optionsMW:this.dropdownOptionsMW
                }
            }];

        } else {
            // Show an error message or perform any other validation
            console.error('Please select Salesforce and Middleware objects before mapping.');
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Both Objects Must be Selected!!',
                    variant: 'error'
                })
            );
        }
    }

    @wire(getStandardObjects)
    wiredStandardObjects({ data, error }) {
        if (data) {
            this.objectOptions = data.map(obj => ({
                label: obj.label,
                value: obj.apiName
            }));
        } else if (error) {
            console.error(error);
        }
    }
}