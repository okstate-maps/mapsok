export function FilterRankQuery (tableName, bounds, per_page, offset, fields ) {return `SELECT
        ${fields}

       FROM ${tableName} WHERE 

       
       ST_GeomFromText('${bounds}', 4326) && the_geom

       ORDER BY 

      (
            CASE
              WHEN ST_Contains(  St_Transform(St_geomfromtext('${bounds}', 4326),3857), the_geom_webmercator)
                THEN area
              WHEN ST_Within(  St_Transform(St_geomfromtext('${bounds}', 4326),3857), the_geom_webmercator)
                THEN ST_Area(St_Transform(St_geomfromtext('${bounds}', 4326),3857))
              ELSE
                 ST_Area(ST_Intersection(
                     St_Transform(St_geomfromtext('${bounds}', 4326),3857),
                     the_geom_webmercator
                 ))  
               END  

         / area ) 

        + 
        
         (
           CASE
              WHEN ST_Contains(  St_Transform(St_geomfromtext('${bounds}', 4326),3857), the_geom_webmercator)
                THEN area
              WHEN ST_Within(  St_Transform(St_geomfromtext('${bounds}', 4326),3857), the_geom_webmercator)
                THEN   ST_Area(St_Transform(St_geomfromtext('${bounds}', 4326),3857))
              ELSE
                 ST_Area(ST_Intersection(
                     St_Transform(St_geomfromtext('${bounds}', 4326),3857),
                 the_geom_webmercator
              )  )  
             END
           / 
           ST_Area(
             St_Transform(
               St_geomfromtext('${bounds}', 4326),
              3857))

          ) DESC, original_date ASC

       LIMIT ${per_page} OFFSET ${offset}`;
     }

export default FilterRankQuery;