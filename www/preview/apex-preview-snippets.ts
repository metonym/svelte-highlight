export type ApexPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const apexPreviewSnippets: ApexPreviewSnippet[] = [
  {
    title: "Lightning controller",
    description: "an @AuraEnabled method with inline SOQL",
    code: `public with sharing class ContactController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts(Id accountId) {
        return [
            SELECT Id, FirstName, LastName, Email
            FROM Contact
            WHERE AccountId = :accountId
            WITH SECURITY_ENFORCED
            ORDER BY LastName ASC
            LIMIT 50
        ];
    }

    @AuraEnabled
    public static void updateContact(Contact record) {
        try {
            update record;
        } catch (DmlException e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}`,
  },
  {
    title: "Trigger",
    description: "before and after events with Trigger context variables",
    code: `trigger OpportunityTrigger on Opportunity (before insert, before update, after update) {
    if (Trigger.isBefore) {
        for (Opportunity opp : Trigger.new) {
            if (opp.Amount == null) {
                opp.Amount = 0;
            }
        }
    }

    if (Trigger.isAfter && Trigger.isUpdate) {
        List<Task> tasks = new List<Task>();
        for (Opportunity opp : Trigger.new) {
            Opportunity old = Trigger.oldMap.get(opp.Id);
            if (opp.StageName == 'Closed Won' && old.StageName != 'Closed Won') {
                tasks.add(new Task(WhatId = opp.Id, Subject = 'Send welcome kit'));
            }
        }
        insert tasks;
    }
}`,
  },
  {
    title: "Batch job",
    description: "Database.Batchable with a QueryLocator",
    code: `global class StaleLeadCleanup implements Database.Batchable<SObject> {
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(
            'SELECT Id FROM Lead WHERE LastModifiedDate < LAST_N_DAYS:365'
        );
    }

    global void execute(Database.BatchableContext bc, List<Lead> scope) {
        delete scope;
    }

    global void finish(Database.BatchableContext bc) {
        System.debug('Stale leads removed');
    }
}`,
  },
  {
    title: "Unit test",
    description: "@IsTest with @TestSetup and Test.startTest",
    code: `@IsTest
private class ContactControllerTest {
    @TestSetup
    static void setup() {
        Account acc = new Account(Name = 'Acme');
        insert acc;
        insert new Contact(LastName = 'Smith', AccountId = acc.Id);
    }

    @IsTest
    static void returnsContactsForAccount() {
        Account acc = [SELECT Id FROM Account LIMIT 1];

        Test.startTest();
        List<Contact> contacts = ContactController.getContacts(acc.Id);
        Test.stopTest();

        System.assertEquals(1, contacts.size());
    }
}`,
  },
];
