var Page = function() {
  var _tableList = [];
  var _guestList = [];
  var _totalTables = 0;
  var _totalGuests = 0;
  
  var setPageEvents = function() {
    $('#importGuestListInput').on('change', function(event) {
      event.preventDefault();
      
      Papa.parse($('#importGuestListInput')[0].files[0], {
        header: true,
        complete: function(results, file) {
          _.each(results.data, function(guestData) {
            if (guestData["Our Wedding - RSVP"] == "Attending") {
              Page.addGuestToList(guestData["First Name"], guestData["Last Name"]);
            }
          });
        },
        error: function(error, file) {
          console.log(error);
        }
      });
    });
    
    $('#importLayoutInput').on('change', function(event) {
      event.preventDefault();
      
      Papa.parse($('#importLayoutInput')[0].files[0], {
        header: true,
        complete: function(results, file) {
          _.each(results.data, function(guestData) {
            if (guestData["Table"] != "") {
              var table = _.find(_tableList, function(table) {
                return table.getName() == guestData["Table"];
              });  
              
              if (!table) {
                Page.addTable(guestData["Table"], 10, []);
              }
            }
            
            Page.addGuestToList(guestData["First Name"], guestData["Last Name"], guestData["Table"]);
          });
        },
        error: function(error, file) {
          console.log(error);
        }
      });
    });
    
    $('#saveButton').on('click', function(event) {
      event.preventDefault();
      
      var tabledGuestList = [];
      
      _.each(_guestList, function(guest) {
        if (guest.getTableId() != null) {
          var table = _.find(_tableList, function(table) {
            return table.getId() == guest.getTableId();
          });
          
          if (table) {
            guest.setTableName(table.getName());
          }
        } 
        
        tabledGuestList.push(guest.exportObject());
      });
      
      var csv = Papa.unparse(_.sortBy(tabledGuestList, 'Table'));
      console.log(csv);
      
      if (!csv.match(/^data:text\/csv/i)) {
        csv = "data:text/csv;charset=utf-8," + csv;
      }
      data = encodeURI(csv);
      
      var link = document.createElement('a');
      link.setAttribute('href', data);
      link.setAttribute('download', 'seating_arrangement.csv');
      link.click();
    });
    
    $('#addGuestButton').on('click', function(event) {
      event.preventDefault();
      
      Page.addGuestToList("First", "Last");
    });
    
    $('#addTableButton').on('click', function(event) {
      event.preventDefault();
      
      Page.addTable("Table Name", 10, []);
    });
  };
  
  var addGuestContainer = function(parentContainerJqueryId, guest) {
    var html = ("<div id='guest" + guest.getId() + "' data-id='" + guest.getId() + "' class='guest'>"
      + "  <span class='glyphicon glyphicon-remove remove-guest'></span>"
      + "  <span class='guest-name'>" + guest.getFirstName() + " " + guest.getLastName() + "</span>"
      + "  <div class='guest-change'>"
      + "    <input class='first-name-input' type='text' placeholder='First' value='" + guest.getFirstName() + "' />"
      + "    <input class='last-name-input' type='text' placeholder='Last' value='" + guest.getLastName() + "' />"
      + "    <span class='glyphicon glyphicon-ok save-guest-changes'></span>"
      + "  </div>"
      + "</div>");
      
      $(parentContainerJqueryId).prepend(html);
      
      $('#guest' + guest.getId()).data('guest', guest).draggable({
        containment: '.container',
        revert: true,
        cursor: 'move',
        stack: '.container-content div',
        start:  function() {
          $('.guest-list-panel .container-content').css('overflow-y', 'unset');
        },
        stop: function() {
          $('.guest-list-panel .container-content').css('overflow-y', '');
        }
      });
      
      setGuestEvents("#guest" + guest.getId(), guest);
  };
  
  var setGuestEvents = function(jqueryId, guest) {
    $(jqueryId + ' .remove-guest').on('click', function(event) {
      event.preventDefault();
      
      Page.removeGuestFromList(jqueryId, guest.getId());
    });
    
    $(jqueryId + ' .guest-name').on('click', function(event) {
      event.preventDefault();
      
      $(jqueryId + ' .guest-change').show();
      $(jqueryId + ' .guest-name').hide();
    });
    
    $(jqueryId + ' .save-guest-changes').on('click', function(event) {
      event.preventDefault();
      
      $(jqueryId + ' .guest-change').hide();
      $(jqueryId + ' .guest-name').show();
    });
    
    $(jqueryId + ' input').on('blur', function(event) {
      if ($(this).hasClass('first-name-input')) {
        guest.setFirstName($(this).val());
      } else {
        guest.setLastName($(this).val());
      }
      
      $(this).parents('.guest').find('.guest-name').text(guest.getFirstName() + " " + guest.getLastName());
    });
  };
  
  var addTableContainer = function(parentContainerJqueryId, table) {
    var html = ("<div id='table" + table.getId() + "' class='wedding-table col-xs-3'>"
      + "  <span class='glyphicon glyphicon-remove remove-table'></span>"
      + "  <label class='wedding-table-label'>" + table.getName() + "</label>"
      + "  <div class='wedding-table-change'>"
      + "    <input class='table-name-input' type='text' placeholder='Table Name' value='" + table.getName() + "' />"
      + "    <span class='glyphicon glyphicon-ok save-table-changes'></span>"
      + "  </div>"
      + "  <div>"
      + "    <div class='guest-list-toggle'>Guests (<span class='num-guests'>" + table.getNumGuests() + "</span>)</div>"
      + "    <div class='wedding-guest-container'></div>"
      + "  </div>"
      + "</div>");
      
      $(parentContainerJqueryId).append(html);
      
      refreshTableClasses();
      
      $('#table' + table.getId()).data('table', table).droppable({
        accept: '.guest-list-panel .container-content div',
        hoverClass: 'hovered',
        drop: function(event, ui) {
          var guest = ui.draggable.data('guest');
          var table = $(this).data('table');

          ui.draggable.draggable('option', 'revert', false);
          $('#guest' + guest.getId()).remove();   // Remove guest container from the list
          Page.addGuestToTable(guest, table);
        }
      });
      
      setTableEvents("#table" + table.getId(), table);
  };
  
  var setTableEvents = function(jqueryId, table) {
    $(jqueryId + ' .remove-table').on('click', function(event) {
      event.preventDefault();
      
      Page.removeTable(jqueryId, table.getId());
    });
    
    $(jqueryId + ' .wedding-table-label').on('click', function(event) {
      event.preventDefault();
      
      $(jqueryId + ' .wedding-table-label').css('display', 'none');
      $(jqueryId + ' .wedding-table-change').css('display', 'table');
    });
    
    $(jqueryId + ' .save-table-changes').on('click', function(event) {
      event.preventDefault();
      
      $(jqueryId + ' .wedding-table-label').css('display', 'table');
      $(jqueryId + ' .wedding-table-change').css('display', 'none');
    });
    
    $(jqueryId + ' .guest-list-toggle').on('click', function(event) {
      event.preventDefault();
      
      $(jqueryId + ' .wedding-guest-container').slideToggle(200);
    });
    
    $(jqueryId + ' input').on('blur', function(event) {
      event.preventDefault();
      
      table.setName($(this).val());
      $(this).parents('.wedding-table').find('label').text(table.getName());
    });
  };
  
  var addGuestToTableContainer = function(parentContainerJqueryId, guest, table) {
    var html = ("<div id='table" + table.getId() + "guest" + guest.getId() + "' class='guest' data-id='" + guest.getId() + "'>"
      + "  <span class='glyphicon glyphicon-remove remove-table-guest'></span>"
      + "  <span class='table-guest-name'>" + guest.getFirstName() + " " + guest.getLastName() + "</span>" 
      + "</div>");
      
      $(parentContainerJqueryId).append(html);
      setTableGuestEvents('#table' + table.getId() + 'guest' + guest.getId(), guest, table);
  };
  
  var setTableGuestEvents = function(jqueryId, guest, table) {
    $(jqueryId + ' .remove-table-guest').on('click', function(event) {
      event.preventDefault();
      
      Page.removeGuestFromTable(jqueryId, guest, table.getId());
    });
  };
  
  var refreshTableClasses = function() {
    $('.wedding-table-container .wedding-table:nth-child(3n+1)').removeClass('col-xs-offset-1');
    $('.wedding-table-container .wedding-table:nth-child(3n+2)').addClass('col-xs-offset-1');
    $('.wedding-table-container .wedding-table:nth-child(3n)').addClass('col-xs-offset-1');
  }
  
  return {
    init: function() {
      setPageEvents();
    },
    addTable: function(name, maxSize, guestList) {
      var id = _totalTables++;
      var table = new Table(id, name, maxSize);
      
      if (guestList) {
        for (let i=0; i < guestList.length; ++i) {
          table.addGuest(guestList[i]);
        }
      }
      
      _tableList.push(table);
      
      addTableContainer(".wedding-table-container", table);
    },
    removeTable: function(jqueryId, tableId) {
      var tableIdx = _tableList.findIndex(function(element, index, array) {
        return element.getId() == tableId; 
      });
      
      if (tableIdx != -1) {
        _tableList[tableIdx].removeAllGuests();
        _tableList.splice(tableIdx, 1);
        $(jqueryId).remove();
        
        refreshTableClasses();
      }
    },
    addGuestToTable: function(guest, table) {
      var tableIdx = _tableList.findIndex(function(element, index, array) {
        return element.getId() == table.getId();
      });
      
      if (tableIdx != -1) {
        _tableList[tableIdx].addGuest(guest);
        addGuestToTableContainer('#table' + table.getId() + ' .wedding-guest-container', guest, table);
      }
    },
    removeGuestFromTable: function(jqueryId, guest, tableId) {
      var tableIdx = _tableList.findIndex(function(element, index, array) {
        return element.getId() == tableId;
      });
      
      if (tableIdx != -1) {
        _tableList[tableIdx].removeGuest(guest);
        $(jqueryId).remove();
        
        //_guestList.push(guest);
        addGuestContainer('.guest-list-container', guest);
      }
    },
    addGuestToList: function(firstName, lastName, tableName) {
      var id = _totalGuests++;
      
      var guest = new Guest(id, firstName, lastName);
      
      if (tableName) {
        var table = _.find(_tableList, function(table) {
          return table.getName() == tableName;
        });
        
        if (table) {
          Page.addGuestToTable(guest, table);
          //addGuestToTableContainer('#table' + table.getId() + ' .wedding-guest-container', guest, table);
        }
      } else {
        addGuestContainer('.guest-list-container', guest);
      }
      
      _guestList.push(guest);
    },
    removeGuestFromList: function(jqueryId, guestId) {
      var guestIdx = _guestList.findIndex(function(element, index, array) {
        return element.getId() == guestId;
      });
      
      if (guestIdx != -1) {
        _guestList.splice(guestIdx, 1);
        $(jqueryId).remove();
      }
    },
    guestList: _guestList,
    tableList: _tableList
  };
}();

$(document).ready(function() {
  Page.init();
});
