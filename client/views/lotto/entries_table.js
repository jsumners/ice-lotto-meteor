"use strict";
Template.entriesTable.helpers({
  hasEntries: function () {
    return this.entries && this.entries.length > 0;
  },
  isLottoOpen: function() {
    return !this.closed;
  },
  hasOne: function() {
    return this.entries && this.entries.length === 1;
  },
  hasNoWinner: function() {
    return !_.any(this.entries, function(e) {return !!e.winner});
  }
});
Template.entriesTable.events({
  'click .roll': function(e) {
    e.preventDefault();
    var lottoId = Session.get('lottoId');
    Meteor.call('rollForTier', lottoId, this.tier, function(error, result){
      if (error) {
        return throwError(error.reason);
      }
      //console.log(result);
    });
  },
  'click .unroll': function(e) {
    e.preventDefault();
    var lottoId = Session.get('lottoId');
    if (confirm("Are you sure you want to undo the roll?")) {
      Meteor.call('unrollForTier', lottoId, this.tier, function(error, result) {
        if (error) {
          return throwError(error.reason);
        }
      });
    }
  }
});

Template.entryRow.helpers({
  isLottoOpen: function() {
    return !Template.parentData().closed;
  },
  mainUsername: function() {
    return GWUsers.findOne(this.gwuserId).alts[0];
  },
  attributes: function() {
    if (!!this.winner) {
      return { class: "winner" };
    }
    return {};
  }
});

Template.entryRow.events({
  'click .remove': function (e) {
    e.preventDefault();
    var lottoId = Session.get('lottoId');
    var entryId = this._id;
    Meteor.call('entryRemove', entryId, lottoId, function (error, result) {
      if (error) {
        return throwError(error.reason);
      }
    });
  }
});

Template.entryAdd.helpers({
  gwusers: function () {
    return GWUsers.find({}, {fields: {alts: 1}, sort: {'alts.0': 1}});
  }
});

Template.entryAdd.events({
  'submit .entry-add': function (e) {
    e.preventDefault();
    var tier = Session.get('SelectedTier');
    var lottoId = Session.get('lottoId');
    var gwuserId = e.target.gwuserId.value;
    var entry = {
      gwuserId: gwuserId,
      amount: tier
    };
    var errors = validateEntry(entry);
    if (errors.gwuserId || errors.amount) {
      return Session.set('entryAddErrors', errors);
    }

    Meteor.call('entryAdd', entry, lottoId, function (error, result) {
      if (error) {
        return throwError(error.reason);
      }
      e.target.gwuserId.value = '';
    });
  }
});
