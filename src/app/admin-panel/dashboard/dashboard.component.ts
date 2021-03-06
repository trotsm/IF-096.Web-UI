import { Component, OnInit, ViewChild } from '@angular/core';
import { SubjectService } from '../../services/subject.service';
import { TeacherService } from '../../services/teacher.service';
import { ClassService} from '../../services/class.service';
import { StudentsService } from '../../services/students.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ChartType, ChartOptions } from 'chart.js';
import { ClassesFromStream } from '../../models/classes-from-stream';
import { AsyncStreamValidator } from './validators/async-stream.validator';
import { FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  showSpinner = true;
  @ViewChild(FormGroupDirective) chartOptions;
  public streamClasses: FormGroup;
  public data = {
    subjects: 0,
    students: 0,
    classes: 0,
    teachers: 0
  };
  public graphTypes = {
    bar: 'Стовпчикова',
    pie: 'Секторна',
    doughnut: 'Кільцева',
  };
  public objectKeys = Object.keys;
  public numberOfClasses = new Array(12).fill('');
  public studentsOfStream = 0;
  public classesStream: number;
  public icons = ['library_books', 'school', 'group_work', 'person'];
  public titles = ['Предмети', 'Учні', 'Класи', 'Вчителі'];
  public listLinks = ['subjects', 'students', 'groups', 'teachers'];
  public buttonTitles = ['СПИСОК ПРЕДМЕТІВ', 'СПИСОК УЧНІВ', 'СПИСОК КЛАСІВ', 'СПИСОК ВЧИТЕЛІВ'];
  public chartLabels = [];
  public chartData = [];
  public chartType: ChartType = 'bar';
  public chartRoundOptions: ChartOptions = {
    responsive: true,
    legend: {
      display: false,
      position: 'bottom'
    }
  };
  public chartVerticalOptions: ChartOptions = {
    responsive: true,
    tooltips: {
      callbacks: {
        title: () => {
          return '';
        }
      }
    },
    legend: {
      display: false,
      position: 'bottom'
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          callback: value => {
            if (value % 1 === 0) {
              return value;
            }
          }
        }
      }]
    }
  };
  constructor(private subjectService: SubjectService, private teacherService: TeacherService,
              private classService: ClassService, private studentService: StudentsService) { }

  /**
   * Method returns values of dashboard data
   * @returns - Array with values of dashboard data
   */
  public dataValues(): number[] {
    return Object.values(this.data);
  }
  ngOnInit(): void {
    this.createStreamClassesForm();
    this.subjectService.getSubjects().subscribe(result => this.data.subjects = result.length);
    this.teacherService.getTeachers().subscribe(result => this.data.teachers = result.length);
    this.studentService.getNumberOfStudents('active').subscribe(result => this.data.students = result);
    this.classService.getClasses('active').subscribe(result => this.data.classes = result.length);
    this.classService.getClassesByStream().subscribe(result => {
      this.updateChart(result);
      this.showSpinner = false;
    });
  }

  /**
   * Method creates a reactive form for chart options
   */
  private createStreamClassesForm(): void {
    this.streamClasses = new FormGroup({
      classes: new FormControl('', [
        Validators.required,
      ], AsyncStreamValidator(this.classService)),
      graphType: new FormControl('bar', [
        Validators.required
      ])
    });
  }

  /**
   * Method which called after formSubmit of chart options
   * @param form - Object of form with, which gives form controls and form values
   */
  public submitChartChange(form: FormGroup): void {
    const controls = form.controls;
    const values = form.value;
    if (controls.graphType.errors || controls.classes.errors) {
      const controlKeys = Object.keys(controls);
      controlKeys.forEach(key => controls[key].markAsTouched());
      return;
    }
    this.classService.getClassesByStream(values.classes)
      .subscribe((result: ClassesFromStream) => {
        this.chartType = values.graphType;
        this.updateChart(result);
    });
  }

  /**
   * Method updates data in chart
   * @param response - Object with number of all students in stream and array with classNames and number of
   * students in each class
   */
  private updateChart(response): void {
    const data = [];
    const labels = [];
    if (this.chartType === 'bar') {
      response.studentsData.forEach(item => {
        const form = {
          data: [item.numOfStudents],
          label: item.className
        };
        data.push(form);
      });
    } else {
      response.studentsData.forEach(item => {
        data.push(item.numOfStudents);
        labels.push(item.className);
      });
    }
    this.classesStream = parseInt(response.studentsData[0].className, 10);
    this.studentsOfStream = response.allStudents;
    this.chartLabels = labels;
    this.chartData = data;
  }
}
