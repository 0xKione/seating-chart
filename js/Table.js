class Table {
  constructor(id, name, maxSize) {
    this.id = id;
    this.name = name;
    this.maxSize = (name == "Head") ? 15 : maxSize;
    this.guestList = [];
  }
  
  getId() {
    return this.id;
  }
  
  setName(name) {
    this.name = name;
    this.maxSize = (name == "Head") ? 15 : this.maxSize;
  }
  
  getName() {
    return this.name;
  }
  
  getNumGuests() {
    return this.guestList.length;
  }
  
  isFull() {
    return this.guestList.length >= this.maxSize;
  }
  
  addGuest(guest) {
    // Cannot add a guest to a full table
    if (this.isFull()) {
      alert("Table is full!");
      return false;
    }
    
    // Cannot add guest that already belongs to a table
    if (guest.getTableId())
      return false;
    
    // Set the table ID of the guest and add it
    guest.setTableId(this.id);
    this.guestList.push(guest);
    
    $('#table' + this.id + ' .num-guests').html(this.guestList.length);
    
    return true;
  }
  
  removeGuest(guest) {
    var guestIdx = this.guestList.findIndex(function(element, index, array) {
      return element.getId() == guest.getId();
    });
    
    if (guestIdx != -1) {
      guest.setTableId();
      this.guestList.splice(guestIdx, 1);
      
      $('#table' + this.id + ' .num-guests').html(this.guestList.length);
      
      return true;
    }
    
    return false;
  }
  
  removeAllGuests() {
    while(this.guestList.length > 0) {
      var guest = this.guestList[0];
      Page.removeGuestFromTable('#table' + this.id + 'guest' + guest.getId(), guest, this.id);
    }
  }
}
