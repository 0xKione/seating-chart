class Guest {
  constructor(id, firstName, lastName, tableId) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.tableId = tableId || null;
    this.tableName = "";
  }
  
  getId() {
    return this.id;
  }
  
  setFirstName(firstName) {
    this.firstName = firstName;
  }
  
  getFirstName() {
    return this.firstName;
  }
  
  setLastName(lastName) {
    this.lastName = lastName;
  }
  
  getLastName() {
    return this.lastName;
  }
  
  setTableId(tableId) {
    if (tableId || tableId == 0) {
      this.tableId = tableId;
    } else {
      this.tableId = null;
    }
  }
  
  getTableId() {
    return this.tableId;
  }
  
  setTableName(tableName) {
    this.tableName = tableName;
  }
  
  exportObject() {
    return {
      "First Name": this.firstName,
      "Last Name": this.lastName,
      "Table": this.tableName
    }
  }
}
