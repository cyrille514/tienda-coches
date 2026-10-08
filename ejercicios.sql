-- Realización de consultas simples SQL


-- Lista el nombre de todos los empleados que hay en la tabla empleado.
select nombre from empleado;

-- Lista los nombres y los sueldos de todos los empleados de la tabla empleado
select nombre,sueldo from empleado;

-- Lista todas las columnas de la tabla empleado.
select * from empleado;

-- Lista el nombre + apellido de todos los empleados, su fecha de nacimiento y su fecha de contrato.
select nombre,apellido,fecha_nacimiento,fecha_contrato from empleado;

-- Lista el nombre de los empleados, su apellido, el sexo e hijos.
select nombre,apellido,sexo,hijos from empleado;

-- Utiliza los siguientes alias para las columnas: nombre del empleado, apellido del empleado, sexo, número de hijos.
select nombre AS "Nombre",apellido AS "Apellido",sexo AS "Sexo",hijos AS "Número de hijos" from empleado;

-- Lista los nombres + apellidos y el sueldo de todos los empleados de la tabla empleado, mostrando los apellidos en mayúsculas (función upper, operador de concatenación ||)
select nombre || ' ' || UPPER(apellido) AS nombre_completo, sueldo
FROM empleado;

-- Lista los nombres + apellidos y estado civil de todos los empleados de la tabla empleado, mostrando el estado civil en minúscula (función lower, operador de concatenación ||).
select nombre || ' ' || apellido AS nombre_completo,LOWER(estado_civil) AS estado_civil
FROM empleado;

-- Lista los nombres + apellidos de todos los empleados y calcula las iniciales de los mismos (primera letra del nombre y primera letra del apellido seguidas de punto. Ejemplo: Marcos Rodríguez sería M.R.). (función left, operador de concatenación ||)
select nombre || ' ' || apellido AS nombre_completo, LEFT(nombre, 1) || '.' || LEFT(apellido, 1) || '.' AS iniciales
FROM empleado;

-- Lista los nombres + apellidos de todos los empleados y calcula su edad a partir de la fecha de nacimiento. SELECT EXTRACT(YEAR FROM AGE(CURRENT_DATE, '1990-07-20'::date))::int;
select nombre || ' ' || apellido AS nombre_completo, EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_nacimiento))::int AS edad
FROM empleado;

-- Lista los nombres + apellidos de todos los empleados y calcula su antigüedad a partir de la fecha del contrato. (función age).
select nombre || ' ' || apellido AS nombre_completo,  AGE(CURRENT_DATE, fecha_contrato) AS antiguedad
FROM empleado;

-- Lista sin repetir el código de los cargos (fk_cargo) de la tabla empleado.
select distinct fk_cargo
FROM empleado;

-- Lista la tabla empleado ordenada de forma ascendente por apellido y nombre.
select * FROM empleado
ORDER BY apellido ASC, nombre ASC;

-- Lista la tabla empleado ordenada de forma descendente por sueldos.
select * from empleado
order by sueldo desc;

-- Lista los empleados ordenados en primer lugar por el estado civil de forma ascendente y en segundo lugar el sueldo de forma descendente.
select * from empleado
order by estado_civil asc,sueldo desc;

-- Devuelve una lista con las 3 primeras filas de la tabla cargo.
select * from cargo
limit 3;

-- Devuelve una lista con 2 filas a partir de la cuarta fila de la tabla departamento. La cuarta fila también se debe incluir en la respuesta.
select * from departamento
limit 2 offset 3;


-- Lista el nombre + apellido y el sueldo del empleado que gane menos sueldo.
select nombre || ' ' || apellido AS nombre_completo,sueldo
from empleado
order by sueldo asc
limit 1;

-- Lista el nombre + apellido y la fecha de nacimiento del empleado de mayor edad.
select nombre || ' ' || apellido,fecha_nacimiento
from empleado
order by fecha_nacimiento asc
limit 1;

-- Lista el nombre de todos los empleados cuyo fk_departamento es igual a 2.
select nombre from empleado
where fk_departamento = 2;

-- Lista nombre + apellido de los empleados que tienen un sueldo menor o igual a 15.000€.
select nombre || ' ' || apellido AS nombre_completo from empleado
where sueldo <= 15000;

-- Lista nombre + apellido de los empleados que tienen un sueldo mayor o igual a 40.000€.
select nombre || ' ' || apellido AS nombre_completo from empleado
where sueldo >= 40000;

-- Lista nombre + apellido de los empleados que no tienen un sueldo mayor o igual a 14.000€.
select nombre || ' ' || apellido AS nombre_completo from empleado
where not sueldo >= 14000;

-- Lista todos los empleados que tengan un sueldo entre 18.000€ y 25.000€. Sin utilizar el operador BETWEEN.
select * from empleado 
where sueldo >= 18000 and sueldo <= 25000;

-- Lista todos los empleados que tengan un sueldo entre 16.000€ y 20.000€. Utilizando el operador BETWEEN.
select * from empleado 
where sueldo between 16000 and 20000;

-- Lista los empleados que tengan un sueldo mayor que 15.000€ y que el fk_departamento sea igual a 6.
select * from empleado
where sueldo > 15000 and fk_departamento = 6;

-- Lista los empleados donde el fk_cargo sea 1,3 o 5. Sin utilizar el operador IN.
select * from empleado
where fk_cargo = 1 OR fk_cargo = 3 OR fk_cargo =5;

-- Lista todos los empleados donde el fk_cargo sea 1, 3 o 5. Utilizando el el operador IN.
select * from empleado
where fk_cargo IN (1,3,5);

-- Lista el nombre + apellido de los empleados y su mes de nacimiento.
select nombre || ' ' || apellido AS nombre_completo,
EXTRACT(MONTH from fecha_nacimiento) AS mes_nacimiento
from empleado;

-- Lista los empleados cuyo nombre empiece por la letra S.
select * from empleado 
where nombre LIKE 'S%';

-- Lista los empleados cuyo nombre termine por la vocal e.
select * from empleado 
where nombre ILIKE '%e';

-- Lista los cargos que contengan el carácter r.
select * from cargo
where cargo ILIKE '%r%';

-- Devuelve una lista de todos los empleados que contienen la cadena ana en el nombre.
select * from empleado
where nombre ILIKE '%ana%';

-- Haz una lista de todos los empleados que contienen la cadena ez en el apellido y tienen un sueldo inferior a 21.500€.
select * from empleado
where apellido ILIKE '%ez%' and sueldo < 21500;

-- Lista los apellidos cuya longitud sea igual a 4 caracteres.

select apellido from empleado
where length(apellido) = 4;

-- Lista el nombre y el sueldo de todos los empleados que tengan un sueldo mayor o igual a 18.000€. Ordena el resultado en primer lugar por el sueldo (en orden descendente) y en segundo lugar por el apellido (en orden ascendente).

select nombre,sueldo from empleado
where sueldo >= 18000
order by sueldo desc,nombre asc;



-- Realización de consultas multitabla

-- Lista el nombre y apellido de los empleados, su sueldo y el nombre del departamento donde trabaja.

select e.nombre,e.apellido,e.sueldo,d.departamento
FROM empleado e INNER JOIN departamento d ON e.fk_departamento = d.pk_departamento;

-- Lista el nombre y apellido de los empleados, su fecha de contrato y el nombre del cargo. Ordena el resultado por la fecha de contrato.

select e.nombre,e.apellido, e.fecha_contrato,c.cargo AS nombre_cargo
FROM empleado e INNER JOIN cargo c ON e.fk_cargo = c.pk_cargo
ORDER BY e.fecha_contrato;

-- Lista el código del empleado, su nombre y apellido, el código del departameto y el nombre del departamento de los empleados que ganen más de 2000€.

select  e.pk_empleado,e.nombre,e.apellido,d.pk_departamento, d.departamento
FROM empleado e INNER JOIN departamento d ON e.fk_departamento = d.pk_departamento
WHERE e.sueldo > 2000
ORDER BY e.apellido, e.nombre;

-- Indica el nombre, apellido y nombre del cargo del empleado más joven.

select e.nombre,e.apellido,c.cargo
from empleado e
INNER JOIN cargo c ON e.fk_cargo = c.pk_cargo
ORDER BY e.fecha_nacimiento DESC
LIMIT 1;

-- Indica el nombre, apellido y nombre del departamento de los empleados que tengan hijos.

select e.nombre, e.apellido, d.departamento
FROM empleado e INNER JOIN departamento d ON e.fk_departamento = d.pk_departamento
WHERE e.hijos > 0
ORDER BY e.apellido, e.nombre;

-- Lista todos los datos de los empleados de Contabilidad.

select e.*
FROM empleado e INNER JOIN departamento d ON e.fk_departamento = d.pk_departamento
WHERE d.departamento = 'Contabilidad';

-- Lista el nombre y apellido del empleado, el nombre del cargo y el del departamento de los empleados solteros sin hijos

SELECT e.nombre,e.apellido, c.cargo,d.departamento
FROM empleado e INNER JOIN cargo c ON e.fk_cargo = c.pk_cargo
INNER JOIN departamento d ON e.fk_departamento = d.pk_departamento
WHERE e.estado_civil = 'Soltero' AND e.hijos = 0
ORDER BY e.apellido, e.nombre;

-- Lista los empleados de los departamentos de Compras y Ventas sin utilizar el operador IN.

select  e.*
FROM empleado e INNER JOIN departamento d ON e.fk_departamento = d.pk_departamento
WHERE d.departamento = 'Compras' OR d.departamento = 'Ventas';

-- Lista los empleados de los departamentos de Compras y Ventas utilizando el operador IN.

select  e.*
FROM empleado e INNER JOIN departamento d ON e.fk_departamento = d.pk_departamento
WHERE d.departamento IN ( 'Compras','Ventas');

-- Lista el nombre y apellido del empleado, el nombre del cargo y del departamento de aquellas personas que tienen más de 20 años en la empresa. Ordena el resultado en primer lugar por el departamento (en orden ascendente) y en segundo lugar por el tiempo trabajado (en orden descendente)

select e.nombre,e.apellido,c.cargo, d.departamento
FROM empleado e INNER JOIN cargo c ON e.fk_cargo = c.pk_cargo
INNER JOIN departamento d ON e.fk_departamento = d.pk_departamento
WHERE AGE(CURRENT_DATE, e.fecha_contrato) > INTERVAL '20 years'
ORDER BY d.departamento ASC, e.fecha_contrato ASC;

-- Lista nombre y apellido, edad, nombre del cargo, nombre del departamento de los empleados Solteros, Divorciados o Viudos que tengan más de un hijo.

select e.nombre,e.apellido,DATE_PART('year', AGE(CURRENT_DATE, e.fecha_nacimiento)) AS edad, c.cargo, d.departamento
FROM empleado e INNER JOIN cargo c ON e.fk_cargo = c.pk_cargo INNER JOIN departamento d ON e.fk_departamento = d.pk_departamento
WHERE e.estado_civil IN ('Soltero', 'Divorciado', 'Viudo') AND e.hijos > 1
ORDER BY e.apellido, e.nombre;

-- Lista todos departamentos registrados que existen en la base de datos, junto con el código, nombre y apellido del empleado que tiene cada uno de ellos. El listado deberá mostrar también aquellos departamentos que no tienen empleados asociados.

select d.pk_departamento,d.departamento,e.pk_empleado, e.nombre,e.apellido
FROM departamento d LEFT JOIN empleado e ON e.fk_departamento = d.pk_departamento
ORDER BY d.departamento;

-- Lista todos cargos registrados que existen en la base de datos, junto con el nombre y apellido del empleado, la edad y estado civil que tiene cada empleado. El listado deberá mostrar también aquellos cargos que no tienen empleados asociados.

select c.cargo,e.nombre,e.apellido,
EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.fecha_nacimiento)) AS edad,e.estado_civil
FROM cargo c LEFT JOIN empleado e ON e.fk_cargo = c.pk_cargo
ORDER BY c.cargo;

-- Lista los departamentos sin empleados asociados.

select d.pk_departamento,d.departamento
FROM departamento d LEFT JOIN empleado e ON e.fk_departamento = d.pk_departamento
WHERE e.pk_empleado IS NULL;

-- ¿Se puede asignar a un empleado un cargo que no esté registrado en la tabla de cargos? Justifica tu respuesta.

No, no se puede — siempre que exista una clave foránea (foreign key) bien definida entre empleado.fk_cargo y cargo.pk_cargo.

Justificación: la restricción FOREIGN KEY obliga a que cualquier valor introducido en fk_cargo deba existir previamente como pk_cargo en la tabla cargo. Si se intenta insertar o actualizar un empleado con un código de cargo inexistente, PostgreSQL lanzará un error de violación de integridad referencial (algo como violates foreign key constraint).


-- Realización de consultas agrupadas

-- Calcula el número total de empleados que hay en la tabla empleado.

select COUNT(*) AS total_empleados
FROM empleado;

-- Calcula el número total de departamentos que hay en la tabla departamento.

select COUNT(*) AS total_departamentos
FROM departamento;

-- Calcula la media de sueldo de todos los empleados.

select AVG(sueldo) AS media_sueldo
FROM empleado;

-- Indica quién es el empleado más joven

select e.nombre,e.apellido,e.fecha_nacimiento
FROM empleado e
ORDER BY e.fecha_nacimiento DESC
LIMIT 1;

select e.nombre,e.apellido,e.fecha_nacimiento
FROM empleado e
WHERE e.fecha_nacimiento = (SELECT MAX(fecha_nacimiento) FROM empleado);

-- Indica quién es el empleado menos joven.

select e.nombre,e.apellido,e.fecha_nacimiento
FROM empleado e
WHERE e.fecha_nacimiento = (SELECT MIN(fecha_nacimiento) FROM empleado);

-- Calcula el número total de empleados por estado civil.

select estado_civil,COUNT(*) AS Total_empleado FROM empleado
GROUP BY estado_civil
ORDER BY estado_civil;

-- Muestra el número de empleados que han ingresado cada año a la empresa

select EXTRACT(YEAR FROM fecha_contrato) AS anio,COUNT(*) AS total_empleados
FROM empleado
GROUP BY EXTRACT(YEAR FROM fecha_contrato)
ORDER BY anio;

- Lista el nombre y el precio del producto más caro.

select nombre, precio
FROM productos
ORDER BY precio DESC
LIMIT 1;

-- Calcula la suma de los salarios de los empleados por departamento.

SELECT  d.departamento,SUM(e.sueldo) AS suma_salarios
FROM empleado e INNER JOIN departamento d ON e.fk_departamento = d.pk_departamento
GROUP BY d.departamento
ORDER BY d.departamento;

-- Calcula la suma de los salarios de los empleados por sexo.

select sexo,SUM(sueldo) AS suma_salarios
FROM empleado
GROUP BY sexo
ORDER BY sexo;

-- Calcula el número de empleados que son Asistentes.

select COUNT(*) AS total_asistentes
FROM empleado e INNER JOIN cargo c ON e.fk_cargo = c.pk_cargo
WHERE c.cargo = 'Asistente';

-- Calcula la media de hijos de los empleados por sexo y estado civil

select  sexo,estado_civil,AVG(hijos) AS media_hijos
FROM empleado
GROUP BY sexo, estado_civil
ORDER BY sexo, estado_civil;

-- Calcula el sueldo más bajo de los Analistas.

select MIN(e.sueldo) AS sueldo_minimo
FROM empleado e INNER JOIN cargo c ON e.fk_cargo = c.pk_cargo
WHERE c.cargo = 'Analista';

-- Calcula el sueldo más alto de los Analistas.

select MAX(e.sueldo) AS sueldo_maximo
FROM empleado e INNER JOIN cargo c ON e.fk_cargo = c.pk_cargo
WHERE c.cargo = 'Analista';

-- Muestra el sueldo máximo, sueldo mínimo, sueldo promedio y el número total de empleados por cargo.

select c.cargo,MAX(e.sueldo) AS sueldo_maximo,MIN(e.sueldo) AS sueldo_minimo, AVG(e.sueldo) AS sueldo_promedio,
COUNT(*) AS total_empleados
FROM empleado e INNER JOIN cargo c ON e.fk_cargo = c.pk_cargo
GROUP BY c.cargo
ORDER BY c.cargo;

-- Muestra el sueldo máximo, sueldo mínimo, sueldo promedio y el número total de empleados por departamento, ordenando de forma descendente por el sueldo promedio.

select d.departamento, MAX(e.sueldo) AS sueldo_maximo, MIN(e.sueldo) AS sueldo_minimo, AVG(e.sueldo) AS sueldo_promedio,
COUNT(*) AS total_empleados
FROM empleado e INNER JOIN departamento d ON e.fk_departamento = d.pk_departamento
GROUP BY d.departamento
ORDER BY sueldo_promedio DESC;

-- Muestra la edad máxima, edad mínima, edad promedio y el número total de empleados de los departamentos que tienen una edad promedio superior a los 45 años.

select d.departamento,MAX(EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.fecha_nacimiento))) AS edad_maxima,
MIN(EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.fecha_nacimiento))) AS edad_minima,
AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.fecha_nacimiento))) AS edad_promedio,COUNT(*) AS total_empleados
FROM empleado e INNER JOIN departamento d ON e.fk_departamento = d.pk_departamento
GROUP BY d.departamento
HAVING AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.fecha_nacimiento))) > 45
ORDER BY edad_promedio DESC;

-- Calcula el número de empleados que tienen un sueldo mayor o igual a 1800€.

select COUNT(*) AS total_empleados
FROM empleado
WHERE sueldo >= 1800;

-- Calcula el número de empleados que tienen una edad menor o igual a 28 años.

select COUNT(*) AS total_empleados
FROM empleado
WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_nacimiento)) <= 28;

-- Lista los nombres de los departamentos cuyos empleados tienen una edad promedio mayor o igual a 35 años.

select d.departamento
FROM empleado e INNER JOIN departamento d ON e.fk_departamento = d.pk_departamento
GROUP BY d.departamento
HAVING AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.fecha_nacimiento))) >= 35;

-- Devuelve un listado con los nombres de los cargos que tienen 5 o más empleados.

select  c.cargo
FROM empleado e INNER JOIN cargo c ON e.fk_cargo = c.pk_cargo
GROUP BY c.cargo
HAVING COUNT(*) >= 5;

-- Devuelve un listado con los nombres de los departamentos donde el promedio de edad sea superior 40 años.

select d.departamento
FROM empleado e INNER JOIN departamento d ON e.fk_departamento = d.pk_departamento
GROUP BY d.departamento
HAVING AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.fecha_nacimiento))) > 40;


-- Muestra el número total de empleados que tiene cada departamento. El listado también debe incluir los departamentos que no tienen ningún empleado. El resultado mostrará dos columnas, una con el nombre del departamento y otra con el número de empleados que tiene. Ordena el resultado descendentemente por el número de empleados.

select d.departamento,COUNT(e.pk_empleado) AS total_empleados
FROM departamento d LEFT JOIN empleado e ON e.fk_departamento = d.pk_departamento
GROUP BY d.departamento
ORDER BY total_empleados DESC;


-- Explica las diferencias entre las cláusulas WHERE y HAVING, y cuándo utilizar cada una de ellas.

WHERE

Filtra filas individuales antes de agrupar.
No puede usar funciones de agregación (COUNT, SUM, AVG, etc.).
Se aplica antes de GROUP BY.

HAVING

Filtra grupos ya formados por GROUP BY.
Sí puede usar funciones de agregación.
Se aplica después de GROUP BY.

Cuándo usar cada una:

WHERE: Filtrar registros según una condición sobre columnas individuales (ej. sueldo > 2000)

HAVING: Filtrar grupos según un resultado agregado (ej. AVG(sueldo) > 2000)








