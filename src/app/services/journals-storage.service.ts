import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, mergeMap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { Journal } from '../models/journal-data';
import * as _ from 'lodash';
import { Homework } from '../models/homework-data';
import { SaveMark } from '../models/save-mark-data';

@Injectable()
export class JournalsStorageService {
  constructor(private httpClient: HttpClient) {}

  loadingStateChanged = new Subject<boolean>();

  /**
   * Method fetches from the server a single
   * journal object by provided subject ida and class id.
   * @param idSubject - number representing subject id of requested journal.
   * @param idClass - number representing class id of requested journal.
   * @returns - object representing a journal.
   */
  getJournaL(idSubject: number, idClass: number): Observable<Journal[]> {
    this.loadingStateChanged.next(true);
    return this.httpClient
      .get(`/journals/subjects/${idSubject}/classes/${idClass}`)
      .pipe(
        map((response: { status: any; data: Journal[] }) => {
          const journal = response.data;
          for (const journ of journal) {
            journ.marks = journ.marks.sort((a, b) => {
              if (a.dateMark > b.dateMark) {
                return 1;
              }
              if (a.dateMark < b.dateMark) {
                return -1;
              }
            });
          }
          return journal;
        })
      );
  }

  /**
   * Method fetches from the server journals and homework
   * by provided subject id and class id.
   * @param idSubject - number representing subject id of requested journals and homework.
   * @param idClass - number representing class id of requested journals and homework.
   * @returns - object representing journals and homeworks.
   */
  getJournalsAndHomeworks(
    idSubject: number,
    idClass: number
  ): Observable<{ homeworks: { [key: string]: any }; journals: Journal[] }> {
    this.loadingStateChanged.next(true);
    return this.getHomework(idSubject, idClass).pipe(
      mergeMap(homeworks => {
        const journ = new Object() as any;
        journ.homeworks = _.mapKeys(homeworks, 'idLesson');
        return this.getJournaL(idSubject, idClass).pipe(
          map(journals => {
            journ.journals = journals;
            return journ;
          })
        );
      })
    );
  }

  /**
   * Method fetches from the server a single homework
   * object by provided subject ida and class id.
   * @param idSubject - number representing subject id of requested homework.
   * @param idClass - number representing class id of requested homework.
   * @returns - object representing a homework.
   */
  getHomework(idSubject: number, idClass: number): Observable<Homework[]> {
    return this.httpClient
      .get(`/homeworks/subjects/${idSubject}/classes/${idClass}`)
      .pipe(
        map((response: { status: any; data: Homework[] }) => {
          const homeworks = response.data;
          return homeworks;
        })
      );
  }

  /**
   * Common method for fetching from the server list of all journals
   * in class or list of all teacher's journals.
   * The list depends on provided param.
   * @param id - number representing id of requested class/teacher.
   * @param data - string saying whether class or teacher must be fetched.
   * @returns - object representing a journal of class/teacher.
   */
  getJournal(id, data): Observable<Journal> {
    this.loadingStateChanged.next(true);
    return this.httpClient.get(`/journals/${data}/${id}`).pipe(
      map((response: { status: any; data: Journal }) => {
        const journal = response.data;
        return journal;
      })
    );
  }

  /**
   * Method receives configurable object for a mark
   * and saves it to the server in post request.
   * @param obj - object for a mark to be cadded.
   * @returns - object of a newly created mark.
   */
  saveMark(obj: SaveMark): Observable<{ status: any; data: SaveMark }> {
    return this.httpClient.post<{ status: any; data: SaveMark }>(`/marks`, obj);
  }

  // not used yet;
  /**
   * Method for fetching from the server list of all journals
   * for requested class.
   * @param idClass - number representing id of requested class.
   * @returns - object representing a journal of class.
   */
  getClassJournal(idClass): Observable<Journal> {
    return this.httpClient.get(`/journals/class/${idClass}`).pipe(
      map((response: { status: any; data: Journal }) => {
        const journal = response.data;
        return journal;
      })
    );
  }

  // not used yet;
  /**
   * Method fetches journal by given id, groups subjects by classes
   * and returns the result.
   * @param teacherId - number representing id of the journal.
   * @returns - an array of objects with subjects grouped by classes.
   */
  getTeacherJournal(idTeacher): Observable<Journal> {
    return this.httpClient.get(`/journals/teachers/${idTeacher}`).pipe(
      map((response: { status: any; data: Journal }) => {
        const journal = response.data;
        return journal;
      })
    );
  }

  // helper function;
  // not used yet;
  distinctJournals(journals) {
    const result = [];
    const mapped = new Map();
    for (const item of journals) {
      if (!mapped.has(item.idClass)) {
        mapped.set(item.idClass, true);
        result.push({
          idClass: item.idClass,
          className: item.className,
          academicYear: item.academicYear
        });
      }
    }
    return result;
  }

  // not used yet;
  /**
   * Method fetches from the server all journals
   * @returns - object representing a journal.
   */
  getAllJournals(): Observable<Journal[]> {
    return this.httpClient.get<any>('/journals').pipe(
      map((response: { status: any; data: Journal[] }) => {
        const journals = response.data;
        return journals;
      })
    );
  }
}
